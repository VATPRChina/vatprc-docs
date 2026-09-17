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
export interface Terrain {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  step: number;
  rows: number;
  cols: number;
  values: string; // base64, signed little-endian Int16 metres, north to south
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
  terrain?: Terrain | null;
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
}
