use chrono::{DateTime, Utc};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow)]
pub struct AtcBooking {
    pub id: Uuid,
    pub user_id: Uuid,
    pub callsign: String,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
    pub remarks: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct AtcBookingSave {
    pub callsign: String,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
    pub remarks: Option<String>,
}

#[derive(serde::Serialize)]
pub(crate) struct VatsimBooking {
    pub cid: String,
    pub callsign: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct EventAtcBooking {
    pub id: Uuid,
    pub user_id: Uuid,
    pub booked_at: DateTime<Utc>,
}

pub struct CompatFutureController {
    pub callsign: String,
    pub name: String,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
}
