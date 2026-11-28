use crate::modules::navdata::model::{Waypoint, WaypointKind};
use crate::modules::navdata::repository::dfd;
use crate::modules::navdata::service::{NavdataResult, NavdataService};

impl NavdataService {
    pub async fn find_enroute_waypoint(&self, ident: &str) -> NavdataResult<Vec<Waypoint>> {
        let records = dfd::find_enroute_waypoint(&self.db, ident).await?;
        records
            .into_iter()
            .map(|record| record.into_waypoint(WaypointKind::Enroute))
            .collect()
    }

    pub async fn find_terminal_waypoint(&self, ident: &str) -> NavdataResult<Vec<Waypoint>> {
        let records = dfd::find_terminal_waypoint(&self.db, ident).await?;
        records
            .into_iter()
            .map(|record| record.into_waypoint(WaypointKind::Terminal))
            .collect()
    }
}
