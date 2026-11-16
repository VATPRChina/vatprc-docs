use super::{
    dto::{ExamRecordCreateRequest, ExamRecordDto},
    service::sheet_id,
};
use crate::{
    error::ApiError,
    modules::{
        sheet::dto::SheetDto,
        user::{middleware::CurrentUser, models::UserRole},
    },
    services::Services,
};
use axum::{
    Json, Router,
    extract::{Path, State},
    routing::get,
};
use ulid::Ulid;

#[derive(utoipa::OpenApi)]
#[openapi(paths(
    list_exam_records,
    create_exam_record,
    get_exam_record,
    get_exam_record_sheet
))]
pub(crate) struct ApiDoc;

pub fn build_exam_routes() -> Router<Services> {
    Router::new()
        .route("/", get(list_exam_records).post(create_exam_record))
        .route("/record-sheet/{level}", get(get_exam_record_sheet))
        .route("/{id}", get(get_exam_record))
}

#[utoipa::path(get, path = "api/atc/exams", tag = "Exams", security(("oauth2" = [])), responses((status = 200, body = Vec<ExamRecordDto>)))]
async fn list_exam_records(
    State(services): State<Services>,
    current_user: CurrentUser,
) -> Result<Json<Vec<ExamRecordDto>>, ApiError> {
    Ok(Json(
        services
            .exam()
            .list(
                current_user.user_id.ok_or(ApiError::Unauthorized)?,
                can_view_all(&current_user),
            )
            .await?,
    ))
}

#[utoipa::path(post, path = "api/atc/exams", tag = "Exams", security(("oauth2" = [])), request_body = ExamRecordCreateRequest, responses((status = 200, body = ExamRecordDto)))]
async fn create_exam_record(
    State(services): State<Services>,
    current_user: CurrentUser,
    Json(request): Json<ExamRecordCreateRequest>,
) -> Result<Json<ExamRecordDto>, ApiError> {
    current_user.require_role(UserRole::ControllerTrainingInstructor)?;
    Ok(Json(
        services
            .exam()
            .create(current_user.user_id.ok_or(ApiError::Unauthorized)?, request)
            .await?,
    ))
}

#[utoipa::path(get, path = "api/atc/exams/{id}", tag = "Exams", security(("oauth2" = [])), params(("id" = String, Path)), responses((status = 200, body = ExamRecordDto)))]
async fn get_exam_record(
    State(services): State<Services>,
    current_user: CurrentUser,
    Path(id): Path<String>,
) -> Result<Json<ExamRecordDto>, ApiError> {
    Ok(Json(
        services
            .exam()
            .find(
                id.parse::<Ulid>()?.into(),
                current_user.user_id.ok_or(ApiError::Unauthorized)?,
                can_view_all(&current_user),
            )
            .await?,
    ))
}

#[utoipa::path(get, path = "api/atc/exams/record-sheet/{level}", tag = "Exams", security(("oauth2" = [])), params(("level" = String, Path)), responses((status = 200, body = SheetDto)))]
async fn get_exam_record_sheet(
    State(services): State<Services>,
    current_user: CurrentUser,
    Path(level): Path<String>,
) -> Result<Json<SheetDto>, ApiError> {
    current_user.require_role(UserRole::ControllerTrainingInstructor)?;
    let view = services.sheet().find(&sheet_id(&level)?).await?;
    Ok(Json(SheetDto::from_entities(
        view.sheet,
        view.fields.into_iter().filter(|f| !f.is_deleted).collect(),
    )))
}

fn can_view_all(user: &CurrentUser) -> bool {
    user.has_role(UserRole::ControllerTrainingInstructor)
        || user.has_role(UserRole::ControllerTrainingDirectorAssistant)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn instructors_can_create_and_mentors_cannot() {
        for role in [
            UserRole::ControllerTrainingInstructor,
            UserRole::ControllerTrainingDirector,
            UserRole::DivisionDirector,
        ] {
            let user = CurrentUser::for_test_roles([role]);
            assert!(
                user.require_role(UserRole::ControllerTrainingInstructor)
                    .is_ok()
            );
            assert!(can_view_all(&user));
        }
        for role in [
            UserRole::ControllerTrainingMentor,
            UserRole::Controller,
            UserRole::Staff,
        ] {
            let user = CurrentUser::for_test_roles([role]);
            assert!(
                user.require_role(UserRole::ControllerTrainingInstructor)
                    .is_err()
            );
            assert!(!can_view_all(&user));
        }
        let assistant =
            CurrentUser::for_test_roles([UserRole::ControllerTrainingDirectorAssistant]);
        assert!(can_view_all(&assistant));
        assert!(
            assistant
                .require_role(UserRole::ControllerTrainingInstructor)
                .is_err()
        );
    }
}
