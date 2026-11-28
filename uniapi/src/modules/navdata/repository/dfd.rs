use sqlx::{FromRow, SqlitePool};

#[derive(FromRow)]
pub struct FixRecord {
    pub icao_code: String,
    pub identifier: String,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
}

#[derive(Debug, Clone, FromRow)]
pub struct AirportRecord {
    pub airport_identifier: String,
    pub airport_ref_latitude: f64,
    pub airport_ref_longitude: f64,
}

pub async fn find_airport(
    db: &SqlitePool,
    ident: &str,
) -> Result<Option<AirportRecord>, sqlx::Error> {
    sqlx::query_as(
        r#"
            SELECT airport_identifier, airport_ref_latitude, airport_ref_longitude
            FROM tbl_pa_airports
            WHERE airport_identifier = $1;
            "#,
    )
    .bind(ident)
    .fetch_optional(db)
    .await
}

#[derive(Debug, Clone, FromRow)]
pub struct EnrouteAirwayRecord {
    pub area_code: String,
    pub direction_restriction: String,
    pub icao_code: String,
    pub route_identifier: String,
    #[allow(unused)]
    pub seqno: u32,
    pub waypoint_description_code: String,
    pub waypoint_identifier: String,
    pub waypoint_latitude: f64,
    pub waypoint_longitude: f64,
    pub waypoint_ref_table: String,
}

pub async fn find_airway(
    db: &SqlitePool,
    ident: &str,
) -> Result<Vec<EnrouteAirwayRecord>, sqlx::Error> {
    sqlx::query_as(
        "SELECT area_code, COALESCE(direction_restriction, '') AS direction_restriction,
                    icao_code, route_identifier, seqno, waypoint_description_code,
                    waypoint_identifier, waypoint_latitude, waypoint_longitude, waypoint_ref_table
             FROM tbl_er_enroute_airways WHERE route_identifier = $1 ORDER BY area_code, seqno",
    )
    .bind(ident)
    .fetch_all(db)
    .await
}

pub async fn find_vhf(db: &SqlitePool, ident: &str) -> Result<Vec<FixRecord>, sqlx::Error> {
    sqlx::query_as(
        "SELECT icao_code,
                    COALESCE(NULLIF(TRIM(navaid_identifier), ''), dme_ident) AS identifier,
                    COALESCE(navaid_latitude, dme_latitude) AS latitude,
                    COALESCE(navaid_longitude, dme_longitude) AS longitude
             FROM tbl_d_vhfnavaids WHERE navaid_identifier = $1 OR dme_ident = $1
             ORDER BY icao_code, airport_identifier, latitude, longitude",
    )
    .bind(ident)
    .fetch_all(db)
    .await
}

pub async fn find_terminal_ndb(
    db: &SqlitePool,
    ident: &str,
) -> Result<Vec<FixRecord>, sqlx::Error> {
    sqlx::query_as(
        "SELECT airport_identifier AS icao_code, navaid_identifier AS identifier,
                    navaid_latitude AS latitude, navaid_longitude AS longitude
             FROM tbl_pn_terminal_ndbnavaids WHERE navaid_identifier = $1
             ORDER BY airport_identifier, navaid_latitude, navaid_longitude",
    )
    .bind(ident)
    .fetch_all(db)
    .await
}

pub async fn find_enroute_ndb(db: &SqlitePool, ident: &str) -> Result<Vec<FixRecord>, sqlx::Error> {
    sqlx::query_as(
        "SELECT icao_code, navaid_identifier AS identifier,
                    navaid_latitude AS latitude, navaid_longitude AS longitude
             FROM tbl_db_enroute_ndbnavaids WHERE navaid_identifier = $1
             ORDER BY icao_code, navaid_latitude, navaid_longitude",
    )
    .bind(ident)
    .fetch_all(db)
    .await
}

pub async fn find_terminal_waypoint(
    db: &SqlitePool,
    ident: &str,
) -> Result<Vec<FixRecord>, sqlx::Error> {
    sqlx::query_as(
        "SELECT region_code AS icao_code, waypoint_identifier AS identifier,
                    waypoint_latitude AS latitude, waypoint_longitude AS longitude
             FROM tbl_pc_terminal_waypoints WHERE waypoint_identifier = $1
             ORDER BY region_code, waypoint_latitude, waypoint_longitude",
    )
    .bind(ident)
    .fetch_all(db)
    .await
}

pub async fn find_enroute_waypoint(
    db: &SqlitePool,
    ident: &str,
) -> Result<Vec<FixRecord>, sqlx::Error> {
    sqlx::query_as(
        "SELECT icao_code, waypoint_identifier AS identifier,
                    waypoint_latitude AS latitude, waypoint_longitude AS longitude
             FROM tbl_ea_enroute_waypoints WHERE waypoint_identifier = $1
             ORDER BY icao_code, waypoint_latitude, waypoint_longitude",
    )
    .bind(ident)
    .fetch_all(db)
    .await
}

#[derive(FromRow)]
pub struct ProcedureLegRecord {
    pub airport_identifier: String,
    pub procedure_identifier: String,
    pub route_type: String,
    pub transition_identifier: Option<String>,
    pub seqno: u32,
    pub path_termination: Option<String>,
    pub waypoint_identifier: Option<String>,
}

pub async fn procedure_legs(
    db: &SqlitePool,
    table: &'static str,
    column: &'static str,
    value: &str,
) -> Result<Vec<ProcedureLegRecord>, sqlx::Error> {
    sqlx::query_as(&format!(
        "SELECT airport_identifier, procedure_identifier, route_type,
                    transition_identifier, seqno, path_termination, waypoint_identifier
             FROM {table} WHERE {column} = $1
             ORDER BY airport_identifier, procedure_identifier, seqno",
    ))
    .bind(value)
    .fetch_all(db)
    .await
}

#[derive(Debug, FromRow)]
pub struct FirRecord {
    pub area_code: String,
    pub fir_uir_identifier: String,
    pub fir_uir_indicator: String,
    pub seqno: i64,
    pub boundary_via: String,
    pub latitude: f64,
    pub longitude: f64,
}

pub async fn has_fir_table(db: &SqlitePool) -> Result<bool, sqlx::Error> {
    sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master
             WHERE name = 'tbl_uf_fir_uir' COLLATE NOCASE AND type IN ('table', 'view'))",
    )
    .fetch_one(db)
    .await
}

pub async fn fir_records(
    db: &SqlitePool,
    identifiers: &[&str],
) -> Result<Vec<FirRecord>, sqlx::Error> {
    sqlx::query_as::<_, FirRecord>(
        "SELECT area_code, fir_uir_identifier, fir_uir_indicator, seqno,
                    boundary_via, fir_uir_latitude AS latitude, fir_uir_longitude AS longitude
             FROM tbl_uf_fir_uir
             WHERE fir_uir_identifier IN (SELECT value FROM json_each(?))
               AND fir_uir_indicator IN ('F', 'B')
             ORDER BY area_code, fir_uir_identifier, fir_uir_indicator, seqno",
    )
    .bind(serde_json::to_string(identifiers).unwrap())
    .fetch_all(db)
    .await
}
