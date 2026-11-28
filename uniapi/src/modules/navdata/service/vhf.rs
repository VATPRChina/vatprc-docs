use crate::modules::navdata::model::Vhf;
use crate::modules::navdata::repository::dfd::{self, FixRecord};
use crate::modules::navdata::service::{NavdataResult, NavdataService};

impl NavdataService {
    pub async fn find_vhf(&self, ident: &str) -> NavdataResult<Vec<Vhf>> {
        let records = dfd::find_vhf(&self.db, ident).await?;
        records.into_iter().map(FixRecord::into_vhf).collect()
    }
}
