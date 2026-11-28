use super::{InvalidNavdataError, NavdataResult};
use crate::modules::navdata::model::{Ndb, NdbKind, Vhf, Waypoint, WaypointKind};
use crate::modules::navdata::repository::dfd::FixRecord;

impl FixRecord {
    pub fn position(&self) -> NavdataResult<(f64, f64)> {
        Ok((
            self.latitude
                .ok_or(InvalidNavdataError::InvalidNavaidNullLatLong)?,
            self.longitude
                .ok_or(InvalidNavdataError::InvalidNavaidNullLatLong)?,
        ))
    }

    pub fn into_waypoint(self, kind: WaypointKind) -> NavdataResult<Waypoint> {
        let (latitude, longitude) = self.position()?;
        Ok(Waypoint {
            icao_code: self.icao_code.as_str().try_into()?,
            identifier: self.identifier.as_str().try_into()?,
            latitude: latitude.try_into()?,
            longitude: longitude.try_into()?,
            kind,
        })
    }

    pub fn into_ndb(self, kind: NdbKind) -> NavdataResult<Ndb> {
        let (latitude, longitude) = self.position()?;
        Ok(Ndb {
            icao_code: self.icao_code.as_str().try_into()?,
            identifier: self.identifier.as_str().try_into()?,
            latitude: latitude.try_into()?,
            longitude: longitude.try_into()?,
            kind,
        })
    }

    pub fn into_vhf(self) -> NavdataResult<Vhf> {
        let (latitude, longitude) = self.position()?;
        Ok(Vhf {
            icao_code: self.icao_code.as_str().try_into()?,
            identifier: self.identifier.as_str().try_into()?,
            latitude: latitude.try_into()?,
            longitude: longitude.try_into()?,
        })
    }
}
