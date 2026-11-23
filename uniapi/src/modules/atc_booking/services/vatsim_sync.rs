use std::time::Duration;

use anyhow::{Context, ensure};
use chrono::{DateTime, Utc};
use reqwest::header::{AUTHORIZATION, HeaderMap, HeaderValue};
use reqwest::{Client, RequestBuilder, StatusCode, Url};
use serde::Serialize;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::settings;

#[derive(Clone)]
pub(super) struct VatsimBookingSync {
    client: Client,
    bookings_url: Url,
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
        let mut headers = HeaderMap::new();
        headers.insert(AUTHORIZATION, authorization);
        let client = Client::builder()
            .default_headers(headers)
            .redirect(reqwest::redirect::Policy::none())
            .timeout(Duration::from_secs(10))
            .build()?;
        Ok(Some(Self {
            client,
            bookings_url: base_url.join("bookings/external")?,
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
            let status = self
                .send(id, self.client.put(booking_url).json(&booking))
                .await?;
            if status == StatusCode::NOT_FOUND {
                // A booking may predate enabling sync or its previous publication may have failed.
                let status = self
                    .send(
                        id,
                        self.client
                            .post(self.bookings_url.clone())
                            .json(&CreateBooking {
                                external_id: &external_id,
                                booking: &booking,
                            }),
                    )
                    .await?;
                ensure!(
                    status.is_success(),
                    "VATSIM booking POST returned HTTP {status}"
                );
            } else {
                ensure!(
                    status.is_success(),
                    "VATSIM booking PUT returned HTTP {status}"
                );
            }
        } else {
            let status = self.send(id, self.client.delete(booking_url)).await?;
            ensure!(
                status.is_success() || status == StatusCode::NOT_FOUND,
                "VATSIM booking DELETE returned HTTP {status}"
            );
        }

        Ok(())
    }

    async fn send(&self, booking_id: Uuid, request: RequestBuilder) -> anyhow::Result<StatusCode> {
        let request = request.build()?;
        let method = request.method().clone();
        let status = self
            .client
            .execute(request)
            .await
            .with_context(|| format!("VATSIM booking {method} request failed"))?
            .status();
        tracing::info!(%booking_id, %method, %status, "VATSIM ATC booking response");
        Ok(status)
    }
}
