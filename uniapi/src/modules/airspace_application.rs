use axum::{
    Json, Router,
    extract::{Path, State},
    routing::get,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ulid::Ulid;
use uuid::Uuid;

use crate::adapter::email::EmailContent;
use crate::error::ApiError;
use crate::modules::user::middleware::CurrentUser;
use crate::modules::user::models::{UserRole, role_closure_from_strings};
use crate::services::Services;

#[derive(utoipa::OpenApi)]
#[openapi(paths(create, list, review))]
pub(crate) struct ApiDoc;

pub fn routes() -> Router<Services> {
    Router::new()
        .route("/", get(list).post(create))
        .route("/{id}/review", axum::routing::put(review))
}

#[derive(Debug, Clone, Deserialize, Serialize, utoipa::ToSchema)]
pub struct Coordinate {
    latitude: f64,
    longitude: f64,
}

impl Coordinate {
    fn valid(&self) -> bool {
        self.latitude.is_finite()
            && self.longitude.is_finite()
            && (-90.0..=90.0).contains(&self.latitude)
            && (-180.0..=180.0).contains(&self.longitude)
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, utoipa::ToSchema)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Boundary {
    Circle { center: Coordinate, radius_km: f64 },
    Polygon { vertices: Vec<Coordinate> },
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct ApplicationRequest {
    starts_at: DateTime<Utc>,
    ends_at: DateTime<Utc>,
    category: String,
    lower_ft: i32,
    upper_ft: i32,
    label: String,
    remarks: Option<String>,
    boundary: Boundary,
}

impl ApplicationRequest {
    fn validate(&self) -> Result<(), ApiError> {
        if self.ends_at <= self.starts_at {
            return Err(ApiError::bad_request("ends_at", "end must be after start"));
        }
        if !["Restricted", "Danger", "Prohibit"].contains(&self.category.as_str()) {
            return Err(ApiError::bad_request("category", "invalid airspace type"));
        }
        if self.lower_ft < 0 || self.upper_ft < self.lower_ft {
            return Err(ApiError::bad_request("altitude", "invalid altitude range"));
        }
        if self.label.trim().is_empty() || self.label.chars().count() > 200 {
            return Err(ApiError::bad_request(
                "label",
                "label is required and must not exceed 200 characters",
            ));
        }
        if self.remarks.as_ref().is_some_and(|s| s.len() > 5000) {
            return Err(ApiError::bad_request(
                "remarks",
                "remarks exceed 5000 bytes",
            ));
        }
        match &self.boundary {
            Boundary::Circle { center, radius_km }
                if center.valid()
                    && radius_km.is_finite()
                    && *radius_km > 0.0
                    && *radius_km <= 20000.0 =>
            {
                ()
            }
            Boundary::Polygon { vertices }
                if (4..=1001).contains(&vertices.len())
                    && vertices.iter().all(Coordinate::valid)
                    && vertices.first().zip(vertices.last()).is_some_and(|(a, b)| {
                        a.latitude == b.latitude && a.longitude == b.longitude
                    }) =>
            {
                let area: f64 = vertices
                    .windows(2)
                    .map(|v| v[0].longitude * v[1].latitude - v[1].longitude * v[0].latitude)
                    .sum();
                if area.abs() < 1e-12 {
                    return Err(ApiError::bad_request("boundary", "polygon has zero area"));
                }
            }
            _ => {
                return Err(ApiError::bad_request(
                    "boundary",
                    "invalid circle or closed polygon",
                ));
            }
        }
        Ok(())
    }
}

#[derive(Debug, Serialize, sqlx::FromRow, utoipa::ToSchema)]
pub struct Application {
    id: Uuid,
    applicant_id: Uuid,
    applicant_name: String,
    applicant_cid: String,
    created_at: DateTime<Utc>,
    starts_at: DateTime<Utc>,
    ends_at: DateTime<Utc>,
    category: String,
    lower_ft: i32,
    upper_ft: i32,
    label: String,
    remarks: Option<String>,
    boundary: serde_json::Value,
    status: String,
    reviewer_id: Option<Uuid>,
    reviewed_at: Option<DateTime<Utc>>,
    review_comment: Option<String>,
}

#[derive(Deserialize, utoipa::ToSchema)]
pub struct ReviewRequest {
    status: String,
    comment: Option<String>,
}

#[utoipa::path(post, path = "/api/airspace-applications", tag = "Airspace Application", security(("oauth2" = [])), request_body = ApplicationRequest, responses((status = 200, body = Application)))]
async fn create(
    State(services): State<Services>,
    user: CurrentUser,
    Json(request): Json<ApplicationRequest>,
) -> Result<Json<Application>, ApiError> {
    user.require_role(UserRole::AirspaceApplicant)?;
    let user_id = user.user_id.ok_or(ApiError::Unauthorized)?;
    request.validate()?;
    let id = Uuid::from(Ulid::new());
    let boundary = serde_json::to_value(&request.boundary).map_err(|_| ApiError::Internal)?;
    sqlx::query("INSERT INTO public.airspace_application (id, applicant_id, starts_at, ends_at, category, lower_ft, upper_ft, label, remarks, boundary) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)")
        .bind(id).bind(user_id).bind(request.starts_at).bind(request.ends_at).bind(&request.category)
        .bind(request.lower_ft).bind(request.upper_ft).bind(request.label.trim()).bind(request.remarks).bind(boundary)
        .execute(services.db()).await?;
    let application = fetch_application(&services, id)
        .await?
        .ok_or(ApiError::Internal)?;
    let recipients = sqlx::query_as::<_, (Option<String>, Vec<String>)>(
        "SELECT email, roles FROM public.\"user\" WHERE email IS NOT NULL",
    )
    .fetch_all(services.db())
    .await;
    match recipients {
        Ok(users) => {
            for (email, roles) in users {
                if role_closure_from_strings(roles.iter().map(String::as_str))
                    .contains(&UserRole::OperationDirector)
                {
                    if let Some(email) = email {
                        if let Err(error) = services
                            .email()
                            .send(&email, EmailContent::airspace_application_submitted())
                            .await
                        {
                            tracing::warn!(%error, "airspace application notification failed");
                        }
                    }
                }
            }
        }
        Err(error) => tracing::warn!(%error, "could not fetch airspace notification recipients"),
    }
    Ok(Json(application))
}

async fn fetch_application(
    services: &Services,
    id: Uuid,
) -> Result<Option<Application>, sqlx::Error> {
    sqlx::query_as::<_, Application>("SELECT a.*, u.full_name AS applicant_name, u.cid AS applicant_cid FROM public.airspace_application a JOIN public.\"user\" u ON u.id = a.applicant_id WHERE a.id = $1")
        .bind(id).fetch_optional(services.db()).await
}

#[utoipa::path(get, path = "/api/airspace-applications", tag = "Airspace Application", security(("oauth2" = [])), responses((status = 200, body = Vec<Application>)))]
async fn list(
    State(services): State<Services>,
    user: CurrentUser,
) -> Result<Json<Vec<Application>>, ApiError> {
    user.require_role(UserRole::OperationDirector)?;
    let applications = sqlx::query_as::<_, Application>("SELECT a.*, u.full_name AS applicant_name, u.cid AS applicant_cid FROM public.airspace_application a JOIN public.\"user\" u ON u.id = a.applicant_id ORDER BY a.created_at DESC")
        .fetch_all(services.db()).await?;
    Ok(Json(applications))
}

#[utoipa::path(put, path = "/api/airspace-applications/{id}/review", tag = "Airspace Application", security(("oauth2" = [])), params(("id" = String, Path)), request_body = ReviewRequest, responses((status = 200, body = Application)))]
async fn review(
    State(services): State<Services>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(request): Json<ReviewRequest>,
) -> Result<Json<Application>, ApiError> {
    user.require_role(UserRole::OperationDirector)?;
    let reviewer_id = user.user_id.ok_or(ApiError::Unauthorized)?;
    if !["approved", "rejected"].contains(&request.status.as_str()) {
        return Err(ApiError::bad_request("status", "invalid review decision"));
    }
    if request.comment.as_ref().is_some_and(|s| s.len() > 5000) {
        return Err(ApiError::bad_request(
            "comment",
            "comment exceeds 5000 bytes",
        ));
    }
    let updated = sqlx::query("UPDATE public.airspace_application SET status = $2, reviewer_id = $3, reviewed_at = now(), review_comment = $4 WHERE id = $1 AND status = 'submitted'")
        .bind(id).bind(request.status).bind(reviewer_id).bind(request.comment).execute(services.db()).await?;
    if updated.rows_affected() == 0 {
        return Err(ApiError::bad_request(
            "status",
            "application does not exist or has already been reviewed",
        ));
    }
    Ok(Json(
        fetch_application(&services, id)
            .await?
            .ok_or(ApiError::Internal)?,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(boundary: Boundary) -> ApplicationRequest {
        ApplicationRequest {
            starts_at: DateTime::parse_from_rfc3339("2026-12-01T00:00:00Z")
                .unwrap()
                .to_utc(),
            ends_at: DateTime::parse_from_rfc3339("2026-12-01T02:00:00Z")
                .unwrap()
                .to_utc(),
            category: "Restricted".into(),
            lower_ft: 0,
            upper_ft: 10000,
            label: "Test".into(),
            remarks: None,
            boundary,
        }
    }

    #[test]
    fn validates_boundaries_and_time() {
        let point = |latitude, longitude| Coordinate {
            latitude,
            longitude,
        };
        let valid = request(Boundary::Polygon {
            vertices: vec![
                point(21.0, 115.0),
                point(22.0, 115.0),
                point(22.0, 116.0),
                point(21.0, 115.0),
            ],
        });
        assert!(valid.validate().is_ok());
        let open = request(Boundary::Polygon {
            vertices: vec![
                point(21.0, 115.0),
                point(22.0, 115.0),
                point(22.0, 116.0),
                point(21.0, 116.0),
            ],
        });
        assert!(open.validate().is_err());
        let invalid_circle = request(Boundary::Circle {
            center: point(91.0, 115.0),
            radius_km: 1.0,
        });
        assert!(invalid_circle.validate().is_err());
        let mut invalid_time = request(Boundary::Circle {
            center: point(21.0, 115.0),
            radius_km: 1.0,
        });
        invalid_time.ends_at = invalid_time.starts_at;
        assert!(invalid_time.validate().is_err());
    }
}
