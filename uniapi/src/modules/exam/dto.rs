use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::models::ExamExaminer;
use crate::modules::sheet::dto::{SheetFieldAnswerDto, SheetRequestField};
use crate::modules::user::dto::UserDto;

#[derive(Deserialize, utoipa::ToSchema)]
pub struct ExamRecordCreateRequest {
    pub trainee_id: String,
    pub level: String,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
    pub examiners: Vec<ExamExaminer>,
    pub request_answers: Vec<SheetRequestField>,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct ExamRecordDto {
    pub id: String,
    pub instructor_id: String,
    pub instructor: UserDto,
    pub trainee: UserDto,
    pub level: String,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
    pub examiners: Vec<ExamExaminer>,
    pub created_at: DateTime<Utc>,
    pub record_sheet_filing: Vec<SheetFieldAnswerDto>,
}
