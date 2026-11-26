use std::time::Duration;

use chrono::{DateTime, TimeDelta, Utc};
use geo::{Contains, InteriorPoint, LineString, Polygon};
use serde::Deserialize;
use serde_json::{Value, json};
use sqlx::{PgPool, Postgres, Transaction};
use tokio::sync::Notify;
use uuid::Uuid;

use super::{Boundary, Coordinate};
use crate::settings::AirspacePublication;

const OBJECT_KEY: &str = "sectors/vatprc_airspace.json";
const BUCKET: &str = "vatprc-files";
static REVIEW_COMMITTED: Notify = Notify::const_new();

pub(super) async fn mark_pending(tx: &mut Transaction<'_, Postgres>) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE public.airspace_publication SET pending = true WHERE singleton")
        .execute(&mut **tx)
        .await?;
    Ok(())
}

pub(super) fn wake() {
    REVIEW_COMMITTED.notify_one();
}

pub fn start_publication(db: PgPool, settings: Option<&AirspacePublication>) -> anyhow::Result<()> {
    let Some(settings) = settings else {
        tracing::info!("R2 airspace publication is not configured");
        return Ok(());
    };
    anyhow::ensure!(
        settings.account_id.len() == 32
            && settings
                .account_id
                .bytes()
                .all(|byte| byte.is_ascii_hexdigit())
            && !settings.api_token.trim().is_empty(),
        "invalid R2 airspace publication configuration"
    );
    let endpoint = format!(
        "https://api.cloudflare.com/client/v4/accounts/{}/r2/buckets/{BUCKET}/objects/{OBJECT_KEY}",
        settings.account_id
    );
    let token = settings.api_token.clone();
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .redirect(reqwest::redirect::Policy::none())
        .build()?;
    tokio::spawn(async move {
        let mut retry = tokio::time::interval(Duration::from_secs(30));
        retry.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);
        loop {
            tokio::select! {
                _ = REVIEW_COMMITTED.notified() => {}
                _ = retry.tick() => {}
            }
            if let Err(error) = publish_pending(&db, &client, &endpoint, &token).await {
                tracing::warn!(%error, "airspace export will be retried");
            }
        }
    });
    Ok(())
}

async fn publish_pending(
    db: &PgPool,
    client: &reqwest::Client,
    endpoint: &str,
    token: &str,
) -> anyhow::Result<()> {
    let mut tx = db.begin().await?;
    // Serialize writes across replicas. A simultaneous review leaves a new pending job
    // after this transaction releases the row; a failed upload leaves this job pending.
    let pending = sqlx::query_scalar::<_, bool>(
        "SELECT pending FROM public.airspace_publication WHERE singleton AND pending FOR UPDATE SKIP LOCKED",
    )
    .fetch_optional(&mut *tx)
    .await?;
    if pending.is_none() {
        tx.commit().await?;
        return Ok(());
    }

    let approved = sqlx::query_as::<_, ApprovedAirspace>(
        "SELECT id, starts_at, ends_at, category, lower_ft, upper_ft, label, remarks, boundary
         FROM public.airspace_application
         WHERE status = 'approved' AND ends_at > clock_timestamp()
         ORDER BY starts_at, id",
    )
    .fetch_all(&mut *tx)
    .await?;
    let body = format_export(&approved)?;

    #[derive(Deserialize)]
    struct UploadResponse {
        success: bool,
    }

    let result = client
        .put(endpoint)
        .bearer_auth(token)
        .header(reqwest::header::CONTENT_TYPE, "application/octet-stream")
        .body(body)
        .send()
        .await?
        .error_for_status()?
        .json::<UploadResponse>()
        .await?;
    anyhow::ensure!(result.success, "R2 rejected the airspace export");

    sqlx::query("UPDATE public.airspace_publication SET pending = false WHERE singleton")
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    tracing::info!(entries = approved.len(), "published vatprc_airspace.json");
    Ok(())
}

#[derive(sqlx::FromRow)]
struct ApprovedAirspace {
    id: Uuid,
    starts_at: DateTime<Utc>,
    ends_at: DateTime<Utc>,
    category: String,
    lower_ft: i32,
    upper_ft: i32,
    label: String,
    remarks: Option<String>,
    boundary: sqlx::types::Json<Boundary>,
}

fn format_export(approved: &[ApprovedAirspace]) -> anyhow::Result<String> {
    if approved.is_empty() {
        return Ok("[]\n".into());
    }
    let records = approved
        .iter()
        .map(ApprovedAirspace::format_record)
        .collect::<anyhow::Result<Vec<_>>>()?;
    Ok(format!("[{}]\n", records.join(", ")))
}

impl ApprovedAirspace {
    fn format_record(&self) -> anyhow::Result<String> {
        fn point(value: &Coordinate) -> [f64; 2] {
            [value.latitude, value.longitude]
        }
        let (label_coord, geometry): ([f64; 2], Vec<(&str, Value)>) = match &self.boundary.0 {
            Boundary::Circle { center, radius_km } => (
                point(center),
                vec![
                    ("circle", json!(point(center))),
                    ("range", json!(radius_km / 1.852)),
                ],
            ),
            Boundary::Polygon { vertices } => {
                let mut points: Vec<_> = vertices.iter().map(point).collect();
                if points.first() != points.last() {
                    points.push(points[0]);
                }
                let polygon = Polygon::new(
                    LineString::from(
                        points
                            .iter()
                            .map(|[lat, lon]| (*lon, *lat))
                            .collect::<Vec<_>>(),
                    ),
                    Vec::new(),
                );
                let center = polygon
                    .interior_point()
                    .filter(|p| polygon.contains(p))
                    .ok_or_else(|| anyhow::anyhow!("no interior label point for {}", self.id))?;
                (
                    [center.y(), center.x()],
                    vec![("coordinates", json!(points))],
                )
            }
        };

        // The consumer considers the end minute inclusive; the application end is exclusive.
        let last_active = self.ends_at - TimeDelta::nanoseconds(1);
        let activation = [
            ("date_start", self.starts_at.format("%y%m%d").to_string()),
            ("date_end", last_active.format("%y%m%d").to_string()),
            ("day", "0".into()),
            ("time_start", self.starts_at.format("%H%M").to_string()),
            ("time_end", last_active.format("%H%M").to_string()),
        ];
        let category = if self.category == "Prohibit" {
            "Prohibited"
        } else {
            &self.category
        };
        let mut fields = vec![
            ("name", json!(format!("VATPRC-{}", self.id.simple()))),
            ("type", json!(category)),
            ("alt_min", json!(self.lower_ft / 100)),
            ("alt_max", json!((i64::from(self.upper_ft) + 99) / 100)),
            ("label_coord", json!(label_coord)),
            ("label_text", json!(self.label)),
            (
                "user_text",
                json!(self.remarks.as_deref().unwrap_or_default()),
            ),
        ];
        fields.extend(geometry);
        let mut lines = Vec::with_capacity(fields.len() + 1);
        for (index, (key, value)) in fields.into_iter().enumerate() {
            if index == 2 {
                let mut schedule = Vec::new();
                for (key, value) in &activation {
                    schedule.push(format!(
                        "            \"{key}\": {}",
                        serde_json::to_string(value)?
                    ));
                }
                lines.push(format!(
                    "        \"activation\": {{\n{}\n        }}",
                    schedule.join(",\n")
                ));
            }
            lines.push(format!(
                "        \"{key}\": {}",
                serde_json::to_string(&value)?
            ));
        }
        Ok(format!("{{\n{}\n    }}", lines.join(",\n")))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn approved(boundary: Boundary) -> ApprovedAirspace {
        ApprovedAirspace {
            id: Uuid::nil(),
            starts_at: "2026-11-26T23:00:00Z".parse().unwrap(),
            ends_at: "2026-11-27T00:00:00Z".parse().unwrap(),
            category: "Prohibit".into(),
            lower_ft: 101,
            upper_ft: 1999,
            label: "Test".into(),
            remarks: Some("Pilot \"notice\"".into()),
            boundary: sqlx::types::Json(boundary),
        }
    }

    #[test]
    fn exports_circle_and_utc_end_boundary() {
        let body = format_export(&[approved(Boundary::Circle {
            center: Coordinate {
                latitude: 40.0,
                longitude: 116.0,
            },
            radius_km: 18.52,
        })])
        .unwrap();
        let values: Value = serde_json::from_str(&body).unwrap();
        let entry = &values[0];
        assert_eq!(entry["type"], "Prohibited");
        assert_eq!(entry["alt_min"], 1);
        assert_eq!(entry["alt_max"], 20);
        assert_eq!(entry["circle"], json!([40.0, 116.0]));
        assert_eq!(entry["range"], 10.0);
        assert_eq!(
            entry["activation"],
            json!({
                "date_start": "261126", "date_end": "261126", "day": "0",
                "time_start": "2300", "time_end": "2359"
            })
        );
        assert_eq!(entry["user_text"], "Pilot \"notice\"");
        assert!(entry.get("coordinates").is_none());
    }

    #[test]
    fn exports_closed_polygon_with_interior_label() {
        let body = format_export(&[approved(Boundary::Polygon {
            vertices: [(40.0, 116.0), (40.0, 117.0), (41.0, 116.0), (40.0, 116.0)]
                .into_iter()
                .map(|(latitude, longitude)| Coordinate {
                    latitude,
                    longitude,
                })
                .collect(),
        })])
        .unwrap();
        let values: Value = serde_json::from_str(&body).unwrap();
        let entry = &values[0];
        let points = entry["coordinates"].as_array().unwrap();
        assert_eq!(points.first(), points.last());
        let lat = entry["label_coord"][0].as_f64().unwrap();
        let lon = entry["label_coord"][1].as_f64().unwrap();
        assert!(lat > 40.0 && lon > 116.0 && lat - 40.0 + lon - 116.0 < 1.0);
        assert!(entry.get("circle").is_none());
        assert_eq!(format_export(&[]).unwrap(), "[]\n");
    }
}
