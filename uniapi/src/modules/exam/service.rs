use sqlx::PgPool;
use std::collections::HashMap;
use ulid::Ulid;
use uuid::Uuid;

use super::{
    dto::{ExamRecordCreateRequest, ExamRecordDto},
    models::ExamRecord,
    repository,
};
use crate::error::ApiError;
use crate::modules::sheet::{
    dto::SheetFieldAnswerDto,
    models::{SheetAnswerSave, SheetField},
    repository::sheet_filing::SheetFilingTransactionRepository,
    service::SheetService,
};
use crate::modules::user::{dto::UserDto, service::user::UserService};

#[derive(Clone)]
pub struct ExamService {
    db: PgPool,
    sheet: SheetService,
    user: UserService,
}

pub fn sheet_id(level: &str) -> Result<String, ApiError> {
    if !matches!(level, "S1" | "S2" | "S3" | "C1") {
        return Err(ApiError::bad_request("level", "expected S1, S2, S3 or C1"));
    }
    Ok(format!("exam-record-{}", level.to_lowercase()))
}

impl ExamService {
    pub fn new(db: PgPool, sheet: SheetService, user: UserService) -> Self {
        Self { db, sheet, user }
    }

    pub async fn list(
        &self,
        user_id: Uuid,
        can_view_all: bool,
    ) -> Result<Vec<ExamRecordDto>, ApiError> {
        let mut result = Vec::new();
        for record in repository::list(&self.db, user_id, can_view_all).await? {
            result.push(self.to_dto(record).await?);
        }
        Ok(result)
    }

    pub async fn find(
        &self,
        id: Uuid,
        user_id: Uuid,
        can_view_all: bool,
    ) -> Result<ExamRecordDto, ApiError> {
        let record = repository::find(&self.db, id)
            .await?
            .filter(|record| {
                can_view_all || record.trainee_id == user_id || record.instructor_id == user_id
            })
            .ok_or_else(|| ApiError::not_found("exam record", Ulid::from(id).to_string()))?;
        self.to_dto(record).await
    }

    pub async fn create(
        &self,
        instructor_id: Uuid,
        request: ExamRecordCreateRequest,
    ) -> Result<ExamRecordDto, ApiError> {
        let sheet_id = sheet_id(&request.level)?;
        validate_metadata(&request)?;
        let trainee_id: Uuid = request.trainee_id.parse::<Ulid>()?.into();
        if trainee_id == instructor_id {
            return Err(ApiError::bad_request(
                "trainee_id",
                "instructor cannot examine themselves",
            ));
        }
        self.user
            .find_summary_by_id(trainee_id)
            .await?
            .ok_or_else(|| ApiError::not_found("user", request.trainee_id.clone()))?;
        let sheet = self.sheet.find(&sheet_id).await?;
        validate_answers(&sheet.fields, &request)?;
        let answers = request
            .request_answers
            .iter()
            .map(|answer| SheetAnswerSave {
                field_id: answer.id.clone(),
                answer: answer.answer.clone(),
            })
            .collect::<Vec<_>>();
        let mut transaction = self.db.begin().await?;
        let filing_id = transaction
            .set_sheet_filing(&sheet_id, None, instructor_id, &answers)
            .await?;
        let record = repository::create(
            &mut transaction,
            instructor_id,
            trainee_id,
            filing_id,
            &request,
        )
        .await?;
        transaction.commit().await?;
        self.to_dto(record).await
    }

    async fn to_dto(&self, record: ExamRecord) -> Result<ExamRecordDto, ApiError> {
        let instructor = self
            .user
            .find_summary_by_id(record.instructor_id)
            .await?
            .ok_or(ApiError::Internal)?;
        let trainee = self
            .user
            .find_summary_by_id(record.trainee_id)
            .await?
            .ok_or(ApiError::Internal)?;
        let answers = self.sheet.filing_answers(record.sheet_filing_id).await?;
        Ok(ExamRecordDto {
            id: Ulid::from(record.id).to_string(),
            instructor_id: Ulid::from(record.instructor_id).to_string(),
            instructor: UserDto::from_user_summary(instructor, true),
            trainee: UserDto::from_user_summary(trainee, true),
            level: record.level,
            start_at: record.start_at,
            end_at: record.end_at,
            examiners: record.examiners.0,
            created_at: record.created_at,
            record_sheet_filing: answers
                .into_iter()
                .map(|a| SheetFieldAnswerDto::from_entities(a.answer, a.field))
                .collect(),
        })
    }
}

fn validate_metadata(request: &ExamRecordCreateRequest) -> Result<(), ApiError> {
    if request.end_at <= request.start_at {
        return Err(ApiError::bad_request("end_at", "must be after start_at"));
    }
    if request.examiners.len() < 2 || request.examiners.len() > 20 {
        return Err(ApiError::bad_request(
            "examiners",
            "provide between 2 and 20 examiners",
        ));
    }
    let mut cids = std::collections::HashSet::new();
    for examiner in &request.examiners {
        if examiner.name.trim().is_empty()
            || examiner.cid.is_empty()
            || !examiner.cid.bytes().all(|b| b.is_ascii_digit())
            || !cids.insert(&examiner.cid)
            || !matches!(
                examiner.rating.as_str(),
                "S1" | "S2" | "S3" | "C1" | "C3" | "I1" | "I3" | "SUP" | "ADM"
            )
        {
            return Err(ApiError::bad_request(
                "examiners",
                "provide names, unique numeric CIDs and valid ratings",
            ));
        }
    }
    Ok(())
}

fn validate_answers(
    fields: &[SheetField],
    request: &ExamRecordCreateRequest,
) -> Result<(), ApiError> {
    let active: HashMap<_, _> = fields
        .iter()
        .filter(|f| !f.is_deleted)
        .map(|f| (f.id.as_str(), f))
        .collect();
    if active.is_empty() {
        return Err(ApiError::bad_request(
            "request_answers",
            "exam sheet has no fields",
        ));
    }
    let mut seen = std::collections::HashSet::new();
    for answer in &request.request_answers {
        let field = active
            .get(answer.id.as_str())
            .ok_or_else(|| ApiError::bad_request("request_answers", "unknown or deleted field"))?;
        if !seen.insert(answer.id.as_str()) {
            return Err(ApiError::bad_request("request_answers", "duplicate field"));
        }
        // Narrative fields may be blank; each assessment must have a score (including N/A).
        if (field.kind != "long-text" && answer.answer.trim().is_empty())
            || (field.kind == "single-choice"
                && !field.single_choice_options.contains(&answer.answer))
        {
            return Err(ApiError::bad_request(&answer.id, "provide a valid answer"));
        }
    }
    if seen.len() != active.len() {
        return Err(ApiError::bad_request(
            "request_answers",
            "answer every active field",
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::modules::sheet::dto::SheetRequestField;

    fn request() -> ExamRecordCreateRequest {
        serde_json::from_value(serde_json::json!({
            "trainee_id": Ulid::new().to_string(), "level": "S1",
            "start_at": "2026-11-01T10:00:00Z", "end_at": "2026-11-01T11:00:00Z",
            "examiners": [
                {"name": "One", "cid": "1234567", "rating": "I1"},
                {"name": "Two", "cid": "1234568", "rating": "C1"}
            ],
            "request_answers": [{"id": "score", "answer": "N/A"}, {"id": "remarks", "answer": ""}]
        }))
        .unwrap()
    }

    fn fields() -> Vec<SheetField> {
        vec![
            SheetField {
                sheet_id: "exam-record-s1".into(),
                id: "score".into(),
                sequence: 0,
                name_zh: "评分".into(),
                name_en: None,
                kind: "single-choice".into(),
                single_choice_options: vec!["N/A".into(), "I".into(), "S".into(), "G".into()],
                description_zh: None,
                description_en: None,
                is_deleted: false,
            },
            SheetField {
                sheet_id: "exam-record-s1".into(),
                id: "remarks".into(),
                sequence: 1,
                name_zh: "备注".into(),
                name_en: None,
                kind: "long-text".into(),
                single_choice_options: vec![],
                description_zh: None,
                description_en: None,
                is_deleted: false,
            },
        ]
    }

    #[test]
    fn rejects_invalid_times_and_examiner_details() {
        let mut request = request();
        assert!(validate_metadata(&request).is_ok());
        request.end_at = request.start_at;
        assert!(validate_metadata(&request).is_err());
        request.end_at += chrono::Duration::hours(1);
        request.examiners[1].cid = request.examiners[0].cid.clone();
        assert!(validate_metadata(&request).is_err());
        request.examiners[1].cid = "not-a-cid".into();
        assert!(validate_metadata(&request).is_err());
        request.examiners[1].cid = "1234568".into();
        request.examiners[1].rating = "OBS".into();
        assert!(validate_metadata(&request).is_err());
        request.examiners.pop();
        assert!(validate_metadata(&request).is_err());
    }

    #[test]
    fn accepts_na_scores_and_empty_narrative_but_rejects_invalid_answers() {
        let fields = fields();
        let mut request = request();
        assert!(validate_answers(&fields, &request).is_ok());
        for invalid in ["", " ", "Excellent", "S2"] {
            request.request_answers[0].answer = invalid.into();
            assert!(validate_answers(&fields, &request).is_err());
        }
        request.request_answers[0].answer = "G".into();
        request.request_answers.push(SheetRequestField {
            id: "score".into(),
            answer: "I".into(),
        });
        assert!(validate_answers(&fields, &request).is_err());
        request.request_answers.pop();
        request.request_answers.pop();
        assert!(validate_answers(&fields, &request).is_err());
        request.request_answers.push(SheetRequestField {
            id: "other-level-field".into(),
            answer: "S".into(),
        });
        assert!(validate_answers(&fields, &request).is_err());
    }

    #[test]
    fn deleted_fields_cannot_be_filed() {
        let mut fields = fields();
        fields[0].is_deleted = true;
        assert!(validate_answers(&fields, &request()).is_err());
    }

    #[test]
    fn only_cpt_levels_have_sheets() {
        for level in ["S1", "S2", "S3", "C1"] {
            assert!(sheet_id(level).is_ok());
        }
        for level in ["", "s1", "I1", "../other"] {
            assert!(sheet_id(level).is_err());
        }
    }
}
