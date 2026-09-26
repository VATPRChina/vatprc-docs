import { Airspace, Coordinate, Radar, RadarRegion, RadarType } from "./types";

export const BUILTIN_REGIONS = [
  {
    code: "ZBPE",
    name: "ZBPE FIR Beijing",
  },
  {
    code: "ZGZU",
    name: "ZGZU FIR Guangzhou",
  },
  {
    code: "ZHWH",
    name: "ZHWH FIR Wuhan",
  },
  {
    code: "ZJSA",
    name: "ZJSA FIR Sanya",
  },
  {
    code: "ZLHW",
    name: "ZLHW FIR Lanzhou",
  },
  {
    code: "ZPKM",
    name: "ZPKM FIR Kunming",
  },
  {
    code: "ZSHA",
    name: "ZSHA FIR Shanghai",
  },
  {
    code: "ZWUQ",
    name: "ZWUQ FIR Urumqi",
  },
  {
    code: "ZYSH",
    name: "ZYSH FIR Shenyang",
  },
  {
    code: "ZMUB",
    name: "ZMUB FIR Ulaanbaatar",
  },
];

export type DataErrorCode = "radar" | "boundary" | "dataset";
export class RadarDataError extends Error {
  constructor(public code: DataErrorCode) {
    super(code);
  }
}
const fail = (code: DataErrorCode): never => {
  throw new RadarDataError(code);
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
function airspaces(value: unknown): Airspace[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 2000) return fail("dataset");
  return value.map((item) => {
    const a = record(item);
    if (typeof a.name !== "string") return fail("dataset");
    return { name: a.name, points: coordinates(a.points, 2) };
  });
}

export function parseRegion(code: string, airspace: unknown, stations: unknown): RadarRegion {
  const r = record(airspace);
  if (
    r.code !== code ||
    typeof r.name !== "string" ||
    !r.name.trim() ||
    !Array.isArray(stations) ||
    stations.length < 1 ||
    stations.length > 2000
  )
    return fail("dataset");
  const a = record(r.airspace);
  return {
    code,
    name: r.name,
    boundary: coordinates(r.boundary, 3),
    radars: stations.map(radar),
    airspace: { tma: airspaces(a.tma), twr: airspaces(a.twr) },
  };
}
const DATA_URL = "https://files.vatprc.net/radar-coverage/";
const cache = new Map<string, Promise<RadarRegion>>();
async function readJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Radar data HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}
export function loadRegion(code: string): Promise<RadarRegion> {
  if (!BUILTIN_REGIONS.some((region) => region.code === code)) return Promise.reject(new Error("Unknown radar region"));
  let promise = cache.get(code);
  if (!promise) {
    const base = `${DATA_URL.replace(/\/$/, "")}/${code}/`;
    promise = Promise.all([readJson(`${base}airspace.json`), readJson(`${base}stations.json`)])
      .then(([airspace, stations]) => parseRegion(code, airspace, stations))
      .catch((error: unknown) => {
        cache.delete(code);
        throw error;
      });
    cache.set(code, promise);
  }
  return promise;
}
