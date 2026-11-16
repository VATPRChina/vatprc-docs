use super::{dto::ExamRecordCreateRequest, models::ExamRecord};
use sqlx::{PgPool, Postgres, Transaction, types::Json};
use uuid::Uuid;

pub async fn list(
    db: &PgPool,
    user_id: Uuid,
    can_view_all: bool,
) -> Result<Vec<ExamRecord>, sqlx::Error> {
    sqlx::query_as("SELECT * FROM public.exam_record WHERE $2 OR trainee_id = $1 OR instructor_id = $1 ORDER BY start_at DESC, id DESC")
        .bind(user_id).bind(can_view_all).fetch_all(db).await
}

pub async fn find(db: &PgPool, id: Uuid) -> Result<Option<ExamRecord>, sqlx::Error> {
    sqlx::query_as("SELECT * FROM public.exam_record WHERE id = $1")
        .bind(id)
        .fetch_optional(db)
        .await
}

pub async fn create(
    transaction: &mut Transaction<'_, Postgres>,
    instructor_id: Uuid,
    trainee_id: Uuid,
    filing_id: Uuid,
    request: &ExamRecordCreateRequest,
) -> Result<ExamRecord, sqlx::Error> {
    sqlx::query_as("INSERT INTO public.exam_record (id, instructor_id, trainee_id, level, start_at, end_at, examiners, sheet_filing_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *")
        .bind(Uuid::from(ulid::Ulid::new())).bind(instructor_id).bind(trainee_id)
        .bind(&request.level).bind(request.start_at).bind(request.end_at)
        .bind(Json(&request.examiners)).bind(filing_id).fetch_one(&mut **transaction).await
}
