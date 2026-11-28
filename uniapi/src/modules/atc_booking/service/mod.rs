mod vatsim_sync;

use sqlx::PgPool;
use uuid::Uuid;

use crate::modules::event::service::{EventAtcPositionView, EventPositionLookup};
use crate::modules::user::model::UserSummary;
use crate::modules::user::service::user::{UserService, UserServiceError};
use crate::settings;

use self::vatsim_sync::VatsimBookingSync;
use super::model::{AtcBooking, AtcBookingSave, EventAtcBooking, VatsimBooking};
use super::repository::AtcBookingRepository;

#[derive(Clone)]
pub struct AtcBookingService {
    db: PgPool,
    user: UserService,
    event_positions: EventPositionLookup,
    vatsim_sync: Option<VatsimBookingSync>,
}

impl AtcBookingService {
    pub fn new(
        db: PgPool,
        user: UserService,
        event_positions: EventPositionLookup,
        sync_settings: &settings::VatsimBookingSync,
    ) -> anyhow::Result<Self> {
        Ok(Self {
            db,
            user,
            event_positions,
            vatsim_sync: VatsimBookingSync::from_settings(sync_settings)?,
        })
    }

    pub(crate) async fn future_compat_controllers(
        &self,
    ) -> Result<Vec<super::model::CompatFutureController>, AtcBookingServiceError> {
        let bookings = self.db.list_upcoming_atc_bookings().await?;
        let users = self
            .user
            .get_users_bulk(bookings.iter().map(|booking| booking.user_id))
            .await?;
        Ok(bookings
            .into_iter()
            .filter_map(|booking| {
                let user = users.get(&booking.user_id)?;
                Some(super::model::CompatFutureController {
                    callsign: booking.callsign,
                    name: user.full_name.clone(),
                    start_at: booking.start_at,
                    end_at: booking.end_at,
                })
            })
            .collect())
    }

    pub async fn list_upcoming(&self) -> Result<Vec<AtcBookingView>, AtcBookingServiceError> {
        let bookings = self.db.list_upcoming_atc_bookings().await?;
        self.with_details(bookings).await
    }

    pub async fn list_mine_upcoming(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<AtcBookingView>, AtcBookingServiceError> {
        let bookings = self.db.list_upcoming_atc_bookings_by_user(user_id).await?;
        self.with_details(bookings).await
    }

    pub async fn create(
        &self,
        user_id: Uuid,
        booking: AtcBookingSave,
    ) -> Result<AtcBookingView, AtcBookingServiceError> {
        let booking = self.db.create_atc_booking(user_id, booking).await?;
        self.sync_to_vatsim(Some(booking.id)).await;
        self.with_detail(booking).await
    }

    pub async fn update(
        &self,
        id: Uuid,
        user_id: Uuid,
        booking: AtcBookingSave,
    ) -> Result<AtcBookingView, AtcBookingServiceError> {
        let mut transaction = self.db.begin().await?;
        let current = (&mut *transaction)
            .find_atc_booking_for_update(id)
            .await?
            .ok_or(AtcBookingServiceError::NotFound(id))?;
        ensure_editable(&mut transaction, &current, user_id).await?;
        let booking = (&mut *transaction)
            .update_atc_booking(id, booking)
            .await?
            .ok_or(AtcBookingServiceError::NotFound(id))?;
        transaction.commit().await?;
        self.sync_to_vatsim(Some(booking.id)).await;
        self.with_detail(booking).await
    }

    pub async fn delete(
        &self,
        id: Uuid,
        user_id: Uuid,
    ) -> Result<AtcBookingView, AtcBookingServiceError> {
        let mut transaction = self.db.begin().await?;
        let current = (&mut *transaction)
            .find_atc_booking_for_update(id)
            .await?
            .ok_or(AtcBookingServiceError::NotFound(id))?;
        ensure_editable(&mut transaction, &current, user_id).await?;
        let booking = (&mut *transaction)
            .delete_atc_booking(id)
            .await?
            .ok_or(AtcBookingServiceError::NotFound(id))?;
        transaction.commit().await?;
        self.sync_to_vatsim(Some(booking.id)).await;
        self.with_detail(booking).await
    }

    pub(crate) async fn find_event_booking(
        &self,
        id: Uuid,
    ) -> Result<Option<EventAtcBooking>, sqlx::Error> {
        self.db.find_event_atc_booking(id).await
    }

    pub(crate) async fn create_event_booking(
        db: &mut sqlx::PgConnection,
        user_id: Uuid,
        booking: AtcBookingSave,
    ) -> Result<AtcBooking, sqlx::Error> {
        db.create_atc_booking(user_id, booking).await
    }

    pub(crate) async fn update_event_booking(
        db: &mut sqlx::PgConnection,
        id: Uuid,
        booking: AtcBookingSave,
    ) -> Result<(), sqlx::Error> {
        db.update_linked_booking(id, booking).await
    }

    pub(crate) async fn delete_event_booking(
        db: &mut sqlx::PgConnection,
        id: Uuid,
    ) -> Result<(), sqlx::Error> {
        db.delete_linked_booking(id).await
    }

    pub(crate) async fn sync_to_vatsim(&self, booking_id: Option<Uuid>) {
        let (Some(sync), Some(booking_id)) = (&self.vatsim_sync, booking_id) else {
            return;
        };
        let result = async {
            let booking = self.vatsim_booking(booking_id).await?;
            sync.sync_booking(booking_id, booking).await
        }
        .await;
        if let Err(error) = result {
            tracing::warn!(%booking_id, %error, "VATSIM ATC booking sync failed");
        }
    }

    async fn vatsim_booking(
        &self,
        id: Uuid,
    ) -> Result<Option<VatsimBooking>, AtcBookingServiceError> {
        let Some(booking) = self.db.find_vatsim_booking(id).await? else {
            return Ok(None);
        };
        let Some(user) = self.user.find_summary_by_id(booking.user_id).await? else {
            return Ok(None);
        };
        let linked = EventPositionLookup::is_linked(&self.db, id).await?;
        Ok(Some(VatsimBooking {
            cid: user.cid,
            kind: if linked { "event" } else { "booking" }.into(),
            callsign: booking.callsign,
            start: booking.start_at,
            end: booking.end_at,
        }))
    }

    async fn with_details(
        &self,
        bookings: Vec<AtcBooking>,
    ) -> Result<Vec<AtcBookingView>, AtcBookingServiceError> {
        let users = self
            .user
            .get_users_bulk(bookings.iter().map(|booking| booking.user_id))
            .await?;
        let ids: Vec<_> = bookings.iter().map(|booking| booking.id).collect();
        let mut positions = self.event_positions.by_booking_ids(&ids).await?;
        let mut views = Vec::with_capacity(bookings.len());
        for booking in bookings {
            let user = users
                .get(&booking.user_id)
                .ok_or(AtcBookingServiceError::UserNotFound(booking.user_id))?
                .to_owned();
            let event_position = positions.remove(&booking.id);
            views.push(AtcBookingView {
                booking,
                user,
                event_position,
            });
        }
        Ok(views)
    }

    async fn with_detail(
        &self,
        booking: AtcBooking,
    ) -> Result<AtcBookingView, AtcBookingServiceError> {
        let user = self
            .user
            .find_summary_by_id(booking.user_id)
            .await?
            .ok_or(AtcBookingServiceError::UserNotFound(booking.user_id))?;
        Ok(AtcBookingView {
            booking,
            user,
            event_position: None,
        })
    }
}

async fn ensure_editable(
    db: &mut sqlx::PgConnection,
    booking: &AtcBooking,
    user_id: Uuid,
) -> Result<(), AtcBookingServiceError> {
    if booking.user_id != user_id {
        return Err(AtcBookingServiceError::NotOwned(booking.id));
    }
    if EventPositionLookup::is_linked(db, booking.id).await? {
        return Err(AtcBookingServiceError::EventLinked);
    }
    Ok(())
}

pub struct AtcBookingView {
    pub booking: AtcBooking,
    pub user: UserSummary,
    pub event_position: Option<EventAtcPositionView>,
}

#[derive(Debug, thiserror::Error)]
pub enum AtcBookingServiceError {
    #[error("ATC booking {0} not found")]
    NotFound(Uuid),
    #[error("ATC booking {0} is not owned by current user")]
    NotOwned(Uuid),
    #[error("event-linked ATC bookings can only be changed through the event API")]
    EventLinked,
    #[error("user {0} not found")]
    UserNotFound(Uuid),
    #[error("failed to query ATC booking repository: {0}")]
    Database(#[from] sqlx::Error),
    #[error("failed to query user: {0}")]
    User(#[from] UserServiceError),
}
