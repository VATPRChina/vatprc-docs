use std::time::Duration;

use anyhow::{Context, ensure};
use chrono::{DateTime, Utc};
use reqwest::header::{AUTHORIZATION, HeaderValue};
use reqwest::{Client, RequestBuilder, StatusCode, Url};
use serde::Serialize;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::settings;

const USER_AGENT: &str = concat!(env!("CARGO_PKG_NAME"), "/", env!("CARGO_PKG_VERSION"));
const MAX_ERROR_BODY_BYTES: usize = 4096;

#[derive(Clone)]
pub(super) struct VatsimBookingSync {
    client: Client,
    bookings_url: Url,
    authorization: HeaderValue,
}

#[derive(Serialize, FromRow)]
struct Booking {
    cid: String,
    callsign: String,
    #[serde(rename = "type")]
    kind: String,
    start: DateTime<Utc>,
    end: DateTime<Utc>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CreateBooking<'a> {
    external_id: &'a str,
    #[serde(flatten)]
    booking: &'a Booking,
}

impl VatsimBookingSync {
    pub(super) fn from_settings(
        settings: &settings::VatsimBookingSync,
    ) -> anyhow::Result<Option<Self>> {
        if !settings.enabled {
            return Ok(None);
        }

        let mut base_url = Url::parse(&settings.base_url).context("invalid VATSIM booking URL")?;
        ensure!(
            matches!(base_url.scheme(), "http" | "https")
                && base_url.query().is_none()
                && base_url.fragment().is_none(),
            "VATSIM booking URL must be an HTTP(S) base URL"
        );
        if !base_url.path().ends_with('/') {
            base_url.path_segments_mut().expect("HTTP(S) URL").push("");
        }

        let key = settings.api_key.trim();
        ensure!(
            !key.is_empty(),
            "VATSIM booking sync is enabled but no API key is configured"
        );
        let mut authorization = HeaderValue::from_str(&format!("Bearer {key}"))
            .context("invalid VATSIM booking API key")?;
        authorization.set_sensitive(true);
        let client = Client::builder()
            .user_agent(USER_AGENT)
            .redirect(reqwest::redirect::Policy::none())
            .timeout(Duration::from_secs(10))
            .build()?;
        Ok(Some(Self {
            client,
            bookings_url: base_url.join("bookings/external")?,
            authorization,
        }))
    }

    pub(super) async fn sync_booking(&self, db: &PgPool, id: Uuid) -> anyhow::Result<()> {
        let booking = sqlx::query_as::<_, Booking>(
            r#"
            SELECT controller.cid, booking.callsign,
                   CASE WHEN event.atc_booking_id IS NULL THEN 'booking' ELSE 'event' END AS kind,
                   booking.start_at AS start, booking.end_at AS end
            FROM public.atc_booking AS booking
            JOIN public."user" AS controller ON controller.id = booking.user_id
            LEFT JOIN public.event_atc_position_booking AS event ON event.atc_booking_id = booking.id
            WHERE booking.id = $1 AND booking.deleted_at IS NULL AND booking.end_at > statement_timestamp()
            "#,
        )
        .bind(id)
        .fetch_optional(db)
        .await?;

        let external_id = format!("vatprc-uniapi-{id}");
        let mut booking_url = self.bookings_url.clone();
        booking_url
            .path_segments_mut()
            .expect("HTTP(S) URL")
            .push(&external_id);

        if let Some(booking) = booking {
            self.upsert(id, &external_id, booking_url, &booking).await?;
        } else {
            let status = self.send(id, self.client.delete(booking_url)).await?;
            ensure!(
                status.is_success() || status == StatusCode::NOT_FOUND,
                "VATSIM booking DELETE returned HTTP {status}"
            );
        }

        Ok(())
    }

    async fn upsert(
        &self,
        id: Uuid,
        external_id: &str,
        booking_url: Url,
        booking: &Booking,
    ) -> anyhow::Result<()> {
        // An identical POST is idempotent. A 409 means the external ID names different data.
        let status = self
            .send(
                id,
                self.client
                    .post(self.bookings_url.clone())
                    .json(&CreateBooking {
                        external_id,
                        booking,
                    }),
            )
            .await?;
        if status == StatusCode::CONFLICT {
            let status = self
                .send(id, self.client.put(booking_url).json(booking))
                .await?;
            ensure!(
                status.is_success(),
                "VATSIM booking PUT returned HTTP {status}"
            );
        } else {
            ensure!(
                status.is_success(),
                "VATSIM booking POST returned HTTP {status}"
            );
        }
        Ok(())
    }

    async fn send(&self, booking_id: Uuid, request: RequestBuilder) -> anyhow::Result<StatusCode> {
        let request = request
            .header(AUTHORIZATION, self.authorization.clone())
            .build()?;
        let method = request.method().clone();
        let mut response = self
            .client
            .execute(request)
            .await
            .with_context(|| format!("VATSIM booking {method} request failed"))?;
        let status = response.status();
        if status.is_success() {
            tracing::info!(%booking_id, %method, %status, "VATSIM ATC booking response");
            return Ok(status);
        }

        let cf_ray = response
            .headers()
            .get("cf-ray")
            .and_then(|value| value.to_str().ok())
            .map(str::to_owned);
        let mut body = Vec::new();
        let mut body_read_error = None;
        while body.len() < MAX_ERROR_BODY_BYTES {
            match response.chunk().await {
                Ok(Some(chunk)) => {
                    let take = chunk.len().min(MAX_ERROR_BODY_BYTES - body.len());
                    body.extend_from_slice(&chunk[..take]);
                }
                Ok(None) => break,
                Err(error) => {
                    body_read_error = Some(error);
                    break;
                }
            }
        }
        let body = String::from_utf8_lossy(&body);
        let body = match self
            .authorization
            .to_str()
            .ok()
            .and_then(|header| header.strip_prefix("Bearer "))
        {
            Some(key) => body.replace(key, "[redacted]"),
            None => body.into_owned(),
        };
        tracing::info!(
            %booking_id, %method, %status, ?cf_ray, response_body = ?body, ?body_read_error,
            "VATSIM ATC booking response"
        );
        Ok(status)
    }
}

#[cfg(test)]
mod tests {
    use std::sync::{Arc, Mutex};

    use axum::extract::State;
    use axum::http::HeaderMap;
    use axum::routing::{post, put};
    use axum::{Json, Router};
    use serde_json::Value;
    use tokio::net::TcpListener;

    use super::*;

    #[tokio::test]
    async fn creates_before_attempting_an_update_by_external_id() {
        let calls = Arc::new(Mutex::new(Vec::new()));
        let router = Router::new()
            .route(
                "/api/bookings/external",
                post(
                    |State(calls): State<Arc<Mutex<Vec<_>>>>,
                     headers: HeaderMap,
                     Json(body): Json<Value>| async move {
                        assert_eq!(headers["user-agent"], USER_AGENT);
                        assert_eq!(headers["authorization"], "Bearer local-mock-key");
                        let mut calls = calls.lock().unwrap();
                        let status = match (calls.last(), body["callsign"].as_str()) {
                            (None, Some("ZBAA_TWR")) => StatusCode::CREATED,
                            (Some(_), Some("ZBAA_TWR")) => StatusCode::OK,
                            (Some(_), Some("ZSPD_TWR")) => StatusCode::CONFLICT,
                            _ => StatusCode::BAD_REQUEST,
                        };
                        calls.push(("POST", body));
                        status
                    },
                ),
            )
            .route(
                "/api/bookings/external/vatprc-uniapi-00000000-0000-0000-0000-000000000000",
                put(
                    |State(calls): State<Arc<Mutex<Vec<_>>>>,
                     headers: HeaderMap,
                     Json(body): Json<Value>| async move {
                        assert_eq!(headers["user-agent"], USER_AGENT);
                        assert_eq!(headers["authorization"], "Bearer local-mock-key");
                        let mut calls = calls.lock().unwrap();
                        let status = if calls.is_empty() {
                            StatusCode::FORBIDDEN
                        } else {
                            StatusCode::OK
                        };
                        calls.push(("PUT", body));
                        status
                    },
                ),
            )
            .with_state(calls.clone());
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        let server = tokio::spawn(async move { axum::serve(listener, router).await.unwrap() });
        let sync = VatsimBookingSync::from_settings(&settings::VatsimBookingSync {
            enabled: true,
            base_url: format!("http://{address}/api"),
            api_key: "local-mock-key".into(),
        })
        .unwrap()
        .unwrap();
        let id = Uuid::nil();
        let external_id = format!("vatprc-uniapi-{id}");
        let booking_url = Url::parse(&format!(
            "http://{address}/api/bookings/external/{external_id}"
        ))
        .unwrap();
        let mut booking = Booking {
            cid: "1234567".into(),
            callsign: "ZBAA_TWR".into(),
            kind: "booking".into(),
            start: "2026-11-23T10:00:00Z".parse().unwrap(),
            end: "2026-11-23T12:00:00Z".parse().unwrap(),
        };

        for callsign in ["ZBAA_TWR", "ZBAA_TWR", "ZSPD_TWR"] {
            booking.callsign = callsign.into();
            sync.upsert(id, &external_id, booking_url.clone(), &booking)
                .await
                .unwrap();
        }
        server.abort();

        let calls = calls.lock().unwrap();
        let methods: Vec<_> = calls.iter().map(|(method, _)| *method).collect();
        assert_eq!(methods, ["POST", "POST", "POST", "PUT"]);
        assert_eq!(calls[0].1["externalId"], external_id);
        assert_eq!(calls[3].1["callsign"], "ZSPD_TWR");
    }
}
