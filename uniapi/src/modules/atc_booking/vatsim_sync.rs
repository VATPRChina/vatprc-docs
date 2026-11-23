use std::collections::{HashMap, HashSet};
use std::time::Duration;

use anyhow::{Context, ensure};
use chrono::{DateTime, SubsecRound, Utc};
use reqwest::header::{AUTHORIZATION, HeaderMap, HeaderValue};
use reqwest::{Client, Method, Response, StatusCode, Url};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::settings;

const EXTERNAL_ID_PREFIX: &str = "vatprc-uniapi-";
const SYNC_LOCK: i64 = 0x5641_5450_5243_4154;

pub struct VatsimBookingSync {
    client: Client,
    base_url: Url,
}

#[derive(FromRow)]
struct LocalBooking {
    id: Uuid,
    #[sqlx(flatten)]
    booking: Booking,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RemoteBooking {
    external_id: Option<String>,
    #[serde(flatten)]
    booking: Booking,
}

#[derive(Deserialize, PartialEq, Serialize, FromRow)]
struct Booking {
    cid: String,
    callsign: String,
    #[serde(rename = "type")]
    kind: String,
    start: DateTime<Utc>,
    end: DateTime<Utc>,
}

#[derive(Deserialize)]
struct OrganizationBookings {
    success: bool,
    data: Vec<RemoteBooking>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CreateBooking<'a> {
    external_id: &'a str,
    #[serde(flatten)]
    booking: &'a Booking,
}

#[derive(Debug, thiserror::Error)]
#[error("VATSIM booking API rate limit reached")]
struct RateLimited(Duration);

impl RateLimited {
    fn check(response: &Response) -> Result<(), Self> {
        if response.status() != StatusCode::TOO_MANY_REQUESTS {
            return Ok(());
        }
        let header_seconds = |name| {
            response
                .headers()
                .get(name)?
                .to_str()
                .ok()?
                .parse::<u64>()
                .ok()
        };
        let seconds = header_seconds("retry-after")
            .or_else(|| header_seconds("ratelimit-reset"))
            .unwrap_or(60);
        Err(Self(Duration::from_secs(seconds.max(1))))
    }
}

impl VatsimBookingSync {
    pub fn from_settings(settings: &settings::VatsimBookingSync) -> anyhow::Result<Option<Self>> {
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

        let key = settings
            .api_key
            .as_deref()
            .filter(|key| !key.trim().is_empty())
            .context("VATSIM booking sync is enabled but no API key is configured")?;
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
        Ok(Some(Self { client, base_url }))
    }

    pub async fn run(&self, db: &PgPool) {
        let mut interval = tokio::time::interval(Duration::from_secs(60));
        interval.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);
        loop {
            interval.tick().await;
            if let Err(error) = self.sync(db).await {
                tracing::warn!(%error, "VATSIM ATC booking sync failed");
                if let Some(limit) = error.downcast_ref::<RateLimited>() {
                    tokio::time::sleep(limit.0).await;
                }
            }
        }
    }

    async fn sync(&self, db: &PgPool) -> anyhow::Result<()> {
        // Keep reconciliation serialized across UniAPI instances without locking booking rows.
        let mut tx = db.begin().await?;
        let acquired: bool = sqlx::query_scalar("SELECT pg_try_advisory_xact_lock($1)")
            .bind(SYNC_LOCK)
            .fetch_one(&mut *tx)
            .await?;
        if !acquired {
            return Ok(());
        }

        let response = self
            .client
            .get(self.base_url.join("org/bookings")?)
            .send()
            .await?;
        RateLimited::check(&response)?;
        ensure!(
            response.status().is_success(),
            "VATSIM booking list returned HTTP {}",
            response.status()
        );
        let remote = response.json::<OrganizationBookings>().await?;
        ensure!(remote.success, "VATSIM booking list reported failure");

        let local = sqlx::query_as::<_, LocalBooking>(
            r#"
            SELECT booking.id, controller.cid, booking.callsign,
                   CASE WHEN event.atc_booking_id IS NULL THEN 'booking' ELSE 'event' END AS kind,
                   booking.start_at AS start, booking.end_at AS end
            FROM public.atc_booking AS booking
            JOIN public."user" AS controller ON controller.id = booking.user_id
            LEFT JOIN public.event_atc_position_booking AS event ON event.atc_booking_id = booking.id
            WHERE booking.deleted_at IS NULL AND booking.end_at > now()
            ORDER BY booking.start_at, booking.id
            "#,
        )
        .fetch_all(&mut *tx)
        .await?;
        self.reconcile(local, remote.data).await?;
        tx.commit().await?;
        Ok(())
    }

    async fn reconcile(
        &self,
        local: Vec<LocalBooking>,
        remote: Vec<RemoteBooking>,
    ) -> anyhow::Result<()> {
        let remote: HashMap<_, _> = remote
            .into_iter()
            .filter_map(|entry| {
                let external_id = entry.external_id?;
                let id = external_id.strip_prefix(EXTERNAL_ID_PREFIX)?.parse().ok()?;
                Some((id, entry.booking))
            })
            .collect();
        let local_ids: HashSet<_> = local.iter().map(|entry| entry.id).collect();
        let now = Utc::now();
        let external_url = self.base_url.join("bookings/external/")?;

        // Clear cancellations first so a replacement can reuse the same callsign and time.
        for (id, booking) in &remote {
            if booking.end > now && !local_ids.contains(id) {
                let external_id = format!("{EXTERNAL_ID_PREFIX}{id}");
                let request = self.client.delete(external_url.join(&external_id)?);
                self.write(request, *id, Method::DELETE).await?;
            }
        }

        for LocalBooking { id, mut booking } in local {
            if booking.end <= now {
                continue;
            }
            // The remote calendar represents timestamps at millisecond precision.
            booking.start = booking.start.trunc_subsecs(3);
            booking.end = booking.end.trunc_subsecs(3);
            let external_id = format!("{EXTERNAL_ID_PREFIX}{id}");
            match remote.get(&id) {
                Some(current) if current == &booking => {}
                Some(_) => {
                    let request = self
                        .client
                        .put(external_url.join(&external_id)?)
                        .json(&booking);
                    self.write(request, id, Method::PUT).await?;
                }
                None => {
                    let request = self
                        .client
                        .post(self.base_url.join("bookings/external")?)
                        .json(&CreateBooking {
                            external_id: &external_id,
                            booking: &booking,
                        });
                    self.write(request, id, Method::POST).await?;
                }
            }
        }
        Ok(())
    }

    async fn write(
        &self,
        request: reqwest::RequestBuilder,
        booking_id: Uuid,
        method: Method,
    ) -> anyhow::Result<()> {
        let response = request.send().await?;
        RateLimited::check(&response)?;
        let status = response.status();
        if status.is_success() || (method == Method::DELETE && status == StatusCode::NOT_FOUND) {
            return Ok(());
        }
        match status {
            StatusCode::BAD_REQUEST
            | StatusCode::NOT_FOUND
            | StatusCode::CONFLICT
            | StatusCode::UNPROCESSABLE_ENTITY => {
                tracing::warn!(%booking_id, %method, %status, "VATSIM rejected ATC booking change");
                Ok(())
            }
            _ => anyhow::bail!("VATSIM booking {method} for {booking_id} returned HTTP {status}"),
        }
    }
}
