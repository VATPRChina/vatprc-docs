use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, types::Json};
use uuid::Uuid;

#[derive(Debug, Clone, Deserialize, Serialize, utoipa::ToSchema)]
pub struct ExamExaminer {
    pub name: String,
    pub cid: String,
    pub rating: String,
}

#[derive(Debug, FromRow)]
pub struct ExamRecord {
    pub id: Uuid,
    pub instructor_id: Uuid,
    pub trainee_id: Uuid,
    pub level: String,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
    pub examiners: Json<Vec<ExamExaminer>>,
    pub sheet_filing_id: Uuid,
    pub created_at: DateTime<Utc>,
}
