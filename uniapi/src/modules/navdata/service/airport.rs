use arrayvec::ArrayString;

use tracing::instrument;

use crate::modules::navdata::model::Airport;
use crate::modules::navdata::repository::dfd;
use crate::modules::navdata::service::{NavdataResult, NavdataService};

impl NavdataService {
    #[instrument(skip(self), fields(ident = %ident))]
    pub async fn find_airport(&self, ident: &str) -> NavdataResult<Option<Airport>> {
        let result = dfd::find_airport(&self.db, ident).await?;
        let airport = result
            .map(|record| -> NavdataResult<Airport> {
                Ok(Airport {
                    identifier: ArrayString::from(&record.airport_identifier)?,
                    latitude: record.airport_ref_latitude.try_into()?,
                    longitude: record.airport_ref_longitude.try_into()?,
                })
            })
            .transpose()?;

        Ok(airport)
    }
}
