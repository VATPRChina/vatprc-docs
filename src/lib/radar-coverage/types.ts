/** Coordinates in vatSys data are latitude, longitude (GeoJSON uses the reverse). */
export type Coordinate = [number, number];
export const RADAR_TYPES = ["SSR", "ADSB", "SMR"] as const;
export type RadarType = (typeof RADAR_TYPES)[number];
export interface Radar {
  name: string;
  type: RadarType;
  elevation: number; // feet MSL
  maxRange: number; // nautical miles
  lat: number;
  lon: number;
}
export interface TerrainPreview {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  rows: number;
  cols: number;
  values: Int16Array;
}
export interface Airspace {
  name: string;
  points: Coordinate[];
}
export interface RadarRegion {
  code: string;
  name: string;
  boundary: Coordinate[];
  radars: Radar[];
  airspace?: { tma: Airspace[]; twr: Airspace[] };
}
export interface CoverageRequest {
  region: RadarRegion;
  altitude: number;
  enabled: RadarType[];
}
export interface CoverageResult {
  cells: GeoJSON.FeatureCollection<GeoJSON.Polygon, { type: RadarType | "fusion" | "unknown" }>;
  percentage: number | null;
  unknownPercentage: number;
  stationHeights: (number | null)[];
  terrain?: TerrainPreview;
}
