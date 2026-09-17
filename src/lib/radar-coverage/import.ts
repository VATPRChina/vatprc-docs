import { Airspace, Coordinate, Radar, RadarRegion, RadarType, Terrain } from "./types";

export type ImportErrorCode = "radar" | "boundary" | "dataset";
export class RadarImportError extends Error {
  constructor(public code: ImportErrorCode) {
    super(code);
  }
}
const fail = (code: ImportErrorCode): never => {
  throw new RadarImportError(code);
};
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : fail("dataset");
const numeric = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const coordinate = (value: unknown): Coordinate => {
  if (!Array.isArray(value) || value.length !== 2 || !numeric(value[0], -85, 85) || !numeric(value[1], -180, 180))
    return fail("boundary");
  return [value[0], value[1]];
};
const coordinates = (value: unknown, minimum: number): Coordinate[] => {
  if (!Array.isArray(value) || value.length < minimum || value.length > 10000) return fail("boundary");
  const points = value.map(coordinate);
  // This viewer supports regional polygons, not polygons crossing the antimeridian.
  if (points.length && Math.max(...points.map((p) => p[1])) - Math.min(...points.map((p) => p[1])) > 180)
    return fail("boundary");
  if (minimum >= 3) {
    const area = points.reduce((sum, p, i) => {
      const q = points[(i + 1) % points.length];
      return sum + p[0] * q[1] - q[0] * p[1];
    }, 0);
    if (Math.abs(area) < 1e-10) return fail("boundary");
  }
  return points;
};
function radarType(value: unknown): RadarType {
  const type = String(value).toUpperCase().replaceAll("-", "");
  if (/^SSR(?:_MODE[ACS])?$/.test(type)) return "SSR";
  if (type === "SSR" || type === "ADSB" || type === "SMR") return type;
  return fail("radar");
}
function radar(value: unknown): Radar {
  const r = record(value);
  if (
    typeof r.name !== "string" ||
    !r.name.trim() ||
    !numeric(r.lat, -85, 85) ||
    !numeric(r.lon, -180, 180) ||
    !numeric(r.elevation, -2000, 60000) ||
    !numeric(r.maxRange, 0, 1000)
  )
    return fail("radar");
  return {
    name: r.name,
    type: radarType(r.type),
    lat: r.lat,
    lon: r.lon,
    elevation: r.elevation,
    maxRange: r.maxRange,
  };
}
function terrain(value: unknown): Terrain | undefined {
  if (value == null) return undefined;
  const t = record(value);
  if (
    !numeric(t.minLat, -85, 85) ||
    !numeric(t.maxLat, -85, 85) ||
    t.minLat >= t.maxLat ||
    !numeric(t.minLon, -180, 180) ||
    !numeric(t.maxLon, -180, 180) ||
    t.minLon >= t.maxLon ||
    !numeric(t.step, 0.00001, 5) ||
    !numeric(t.rows, 2, 10000) ||
    !Number.isInteger(t.rows) ||
    !numeric(t.cols, 2, 10000) ||
    !Number.isInteger(t.cols) ||
    t.rows * t.cols > 4000000 ||
    typeof t.values !== "string"
  )
    return fail("dataset");
  if (
    Math.abs(t.maxLat - t.minLat - (t.rows - 1) * t.step) > t.step * 0.01 ||
    Math.abs(t.maxLon - t.minLon - (t.cols - 1) * t.step) > t.step * 0.01
  )
    return fail("dataset");
  try {
    if (atob(t.values).length !== t.rows * t.cols * 2) return fail("dataset");
  } catch {
    return fail("dataset");
  }
  return {
    minLat: t.minLat,
    maxLat: t.maxLat,
    minLon: t.minLon,
    maxLon: t.maxLon,
    step: t.step,
    rows: t.rows,
    cols: t.cols,
    values: t.values,
  };
}
function airspaces(value: unknown): Airspace[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 2000) return fail("dataset");
  return value.map((item) => {
    const a = record(item);
    if (typeof a.name !== "string") return fail("dataset");
    return { name: a.name, points: coordinates(a.points, 2) };
  });
}
/** Accepts the JSON object previously assigned to window.RADAR_DATA; never executes JavaScript. */
export function parseDataset(text: string): RadarRegion[] {
  let data: Record<string, unknown>;
  try {
    data = record(JSON.parse(text));
  } catch {
    return fail("dataset");
  }
  const entries = Object.entries(data);
  if (!entries.length || entries.length > 100) return fail("dataset");
  return entries.map(([key, value]) => {
    const r = record(value);
    if (
      typeof r.code !== "string" ||
      r.code !== key ||
      !r.code.trim() ||
      typeof r.name !== "string" ||
      !Array.isArray(r.radars) ||
      !r.radars.length ||
      r.radars.length > 2000
    )
      return fail("dataset");
    const a = r.airspace == null ? {} : record(r.airspace);
    const boundary = coordinates(r.boundary, 0);
    if (boundary.length) coordinates(boundary, 3);
    return {
      code: r.code,
      name: r.name,
      radars: r.radars.map(radar),
      boundary,
      terrain: terrain(r.terrain),
      airspace: { tma: airspaces(a.tma), twr: airspaces(a.twr) },
    };
  });
}
