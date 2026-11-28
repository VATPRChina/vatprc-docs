use crate::modules::navdata::model::{Ndb, NdbKind};
use crate::modules::navdata::repository::dfd;
use crate::modules::navdata::service::{NavdataResult, NavdataService};

impl NavdataService {
    pub async fn find_enroute_ndb(&self, ident: &str) -> NavdataResult<Vec<Ndb>> {
        let records = dfd::find_enroute_ndb(&self.db, ident).await?;
        records
            .into_iter()
            .map(|record| record.into_ndb(NdbKind::Enroute))
            .collect()
    }

    pub async fn find_terminal_ndb(&self, ident: &str) -> NavdataResult<Vec<Ndb>> {
        let records = dfd::find_terminal_ndb(&self.db, ident).await?;
        records
            .into_iter()
            .map(|record| record.into_ndb(NdbKind::Terminal))
            .collect()
    }
}
