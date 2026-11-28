use crate::modules::navdata::model::{
    Airway, AnyFix, DirectionRestriction, LegKind, Ndb, NdbKind, ResolvedLeg, Vhf, Waypoint,
    WaypointKind,
};
use crate::modules::navdata::repository::dfd::{self, EnrouteAirwayRecord};
use crate::modules::navdata::service::{InvalidNavdataError, NavdataResult, NavdataService};
use arrayvec::ArrayString;
use itertools::Itertools;

impl NavdataService {
    pub async fn find_airway(&self, ident: &str) -> NavdataResult<Option<Airway>> {
        let records = dfd::find_airway(&self.db, ident).await?;
        if records.is_empty() {
            return Ok(None);
        }
        let legs = records
            .iter()
            .tuple_windows()
            .filter(|(from, to)| from.area_code == to.area_code)
            .map(|(from, to)| to.to_leg(from))
            .collect::<NavdataResult<Vec<_>>>()?
            .into_iter()
            .flatten()
            .collect();
        Ok(Some(Airway {
            identifier: ident.try_into()?,
            legs,
        }))
    }
}

impl EnrouteAirwayRecord {
    fn to_leg(&self, prev: &Self) -> NavdataResult<Option<ResolvedLeg>> {
        if prev.waypoint_description_code.chars().nth(1) == Some('E') {
            return Ok(None);
        }

        let leg = ResolvedLeg {
            identifier: Some(self.route_identifier.clone()),
            from: prev.to_fix()?,
            to: self.to_fix()?,
            is_unknown: false,
            kind: LegKind::Airway,
            // Direction restrictions describe the segment leaving the origin record.
            direction_restriction: match prev.direction_restriction.as_str() {
                "F" => DirectionRestriction::Forward,
                "B" => DirectionRestriction::Backward,
                _ => DirectionRestriction::None,
            },
        };
        Ok(Some(leg))
    }

    fn to_fix(&self) -> NavdataResult<AnyFix> {
        let fix = match self.waypoint_ref_table.trim() {
            "EA" => AnyFix::Waypoint(Waypoint {
                icao_code: ArrayString::from(&self.icao_code)?,
                identifier: ArrayString::from(&self.waypoint_identifier)?,
                latitude: self.waypoint_latitude.try_into()?,
                longitude: self.waypoint_longitude.try_into()?,
                kind: WaypointKind::Enroute,
            }),
            "DB" => AnyFix::Ndb(Ndb {
                icao_code: ArrayString::from(&self.icao_code)?,
                identifier: ArrayString::from(&self.waypoint_identifier)?,
                latitude: self.waypoint_latitude.try_into()?,
                longitude: self.waypoint_longitude.try_into()?,
                kind: NdbKind::Enroute,
            }),
            "D" => AnyFix::Vhf(Vhf {
                icao_code: ArrayString::from(&self.icao_code)?,
                identifier: ArrayString::from(&self.waypoint_identifier)?,
                latitude: self.waypoint_latitude.try_into()?,
                longitude: self.waypoint_longitude.try_into()?,
            }),
            _ => {
                return Err(InvalidNavdataError::InternalError(
                    "unsupported airway waypoint reference table",
                ));
            }
        };
        Ok(fix)
    }
}
