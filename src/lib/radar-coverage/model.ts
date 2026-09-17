import { Coordinate, CoverageRequest, CoverageResult, Radar, RadarRegion, Terrain } from "./types";

const DEG = Math.PI / 180;
const EARTH_NM = 3440.065;
const FT_PER_NM = 6076.12;
const EFFECTIVE_EARTH_FT = (20925525 * 4) / 3;
export const RADAR_COLORS = { SSR: "#0891b2", ADSB: "#d97706", SMR: "#a855f7", fusion: "#2563eb", unknown: "#6b7280" };
export function distanceNm(a: Coordinate, b: Coordinate): number {
  const q =
    Math.sin(((b[0] - a[0]) * DEG) / 2) ** 2 +
    Math.cos(a[0] * DEG) * Math.cos(b[0] * DEG) * Math.sin(((b[1] - a[1]) * DEG) / 2) ** 2;
  return 2 * EARTH_NM * Math.asin(Math.min(1, Math.sqrt(q)));
}
export function pointInside(point: Coordinate, polygon: Coordinate[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i],
      [yj, xj] = polygon[j];
    if (yi > point[0] !== yj > point[0] && point[1] < ((xj - xi) * (point[0] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function decodeTerrain(t: Terrain): Int16Array {
  const raw = atob(t.values);
  const view = new DataView(Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer);
  return Int16Array.from({ length: t.rows * t.cols }, (_, i) => view.getInt16(i * 2, true));
}
export function terrainMeters(t: Terrain, values: Int16Array, [lat, lon]: Coordinate): number | null {
  if (lat < t.minLat || lat > t.maxLat || lon < t.minLon || lon > t.maxLon) return null;
  const row = Math.max(0, Math.min(t.rows - 1, Math.round((t.maxLat - lat) / t.step)));
  const col = Math.max(0, Math.min(t.cols - 1, Math.round((lon - t.minLon) / t.step)));
  const value = values[row * t.cols + col];
  return value === undefined || value === -32768 ? null : value;
}
/** Great-circle interpolation avoids a straight latitude/longitude path at high latitudes. */
function interpolate(a: Coordinate, b: Coordinate, fraction: number, angle: number): Coordinate {
  if (angle < 1e-10) return a;
  const first = Math.sin((1 - fraction) * angle) / Math.sin(angle),
    second = Math.sin(fraction * angle) / Math.sin(angle);
  const x = first * Math.cos(a[0] * DEG) * Math.cos(a[1] * DEG) + second * Math.cos(b[0] * DEG) * Math.cos(b[1] * DEG);
  const y = first * Math.cos(a[0] * DEG) * Math.sin(a[1] * DEG) + second * Math.cos(b[0] * DEG) * Math.sin(b[1] * DEG);
  const z = first * Math.sin(a[0] * DEG) + second * Math.sin(b[0] * DEG);
  return [Math.atan2(z, Math.hypot(x, y)) / DEG, Math.atan2(y, x) / DEG];
}
/** null means unavailable terrain, never assumed sea level. */
export function hasLineOfSight(
  t: Terrain,
  values: Int16Array,
  radar: Radar,
  target: Coordinate,
  altitude: number,
): boolean | null {
  const stationPoint: Coordinate = [radar.lat, radar.lon];
  const distance = distanceNm(stationPoint, target);
  if (distance > radar.maxRange) return false;
  const targetGround = terrainMeters(t, values, target),
    stationGround = terrainMeters(t, values, stationPoint);
  if (targetGround === null || stationGround === null) return null;
  if (altitude <= targetGround * 3.28084) return false;
  if (distance < 0.01) return true;
  const station = Math.max(radar.elevation, stationGround * 3.28084);
  const distanceFt = distance * FT_PER_NM;
  const targetSlope = (altitude - station) / distanceFt - distanceFt / (2 * EFFECTIVE_EARTH_FT);
  // Sample more frequently than the supplied 0.1-degree DEM spacing to reduce skipped cells.
  const steps = Math.max(2, Math.ceil(distance));
  let missing = false;
  for (let i = 1; i < steps; i++) {
    const sample = terrainMeters(t, values, interpolate(stationPoint, target, i / steps, distance / EARTH_NM));
    if (sample === null) {
      missing = true;
      continue;
    }
    const sampleFt = (distanceFt * i) / steps;
    const slope = (sample * 3.28084 - station) / sampleFt - sampleFt / (2 * EFFECTIVE_EARTH_FT);
    if (slope > targetSlope + 1e-6) return false;
  }
  return missing ? null : true;
}
export function regionBounds(region: RadarRegion): [number, number, number, number] | null {
  const points = region.boundary.length ? region.boundary : region.radars.map((r) => [r.lat, r.lon] as Coordinate);
  if (!points.length) return null;
  return [
    Math.min(...points.map((p) => p[1])),
    Math.min(...points.map((p) => p[0])),
    Math.max(...points.map((p) => p[1])),
    Math.max(...points.map((p) => p[0])),
  ];
}
/** Include each station's spherical maximum-range envelope, not just the FIR polygon. */
export function coverageBounds(region: RadarRegion): [number, number, number, number] | null {
  let bounds = regionBounds(region);
  for (const radar of region.radars) {
    const radius = radar.maxRange / EARTH_NM;
    const latitudeSpan = radius / DEG;
    const longitudeSpan = Math.asin(Math.min(1, Math.sin(radius) / Math.cos(radar.lat * DEG))) / DEG;
    const range: [number, number, number, number] = [
      radar.lon - longitudeSpan,
      Math.max(-85, radar.lat - latitudeSpan),
      radar.lon + longitudeSpan,
      Math.min(85, radar.lat + latitudeSpan),
    ];
    bounds = bounds
      ? [
          Math.min(bounds[0], range[0]),
          Math.min(bounds[1], range[1]),
          Math.max(bounds[2], range[2]),
          Math.max(bounds[3], range[3]),
        ]
      : range;
  }
  return bounds;
}

export function calculateCoverage({ region, altitude, enabled }: CoverageRequest): CoverageResult {
  const result: CoverageResult = {
    cells: { type: "FeatureCollection", features: [] },
    percentage: null,
    unknownPercentage: 0,
  };
  const bounds = coverageBounds(region),
    t = region.terrain;
  if (!bounds || !t || !region.radars.length) return result;
  const values = decodeTerrain(t),
    radars = region.radars.filter((r) => enabled.includes(r.type));
  const [west, south, east, north] = bounds;
  const cols = 300,
    rows = Math.min(320, Math.max(140, Math.round((cols * (north - south)) / (east - west))));
  const dx = (east - west) / cols,
    dy = (north - south) / rows;
  let total = 0,
    covered = 0,
    unknown = 0;
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) {
      const lon = west + (col + 0.5) * dx,
        lat = south + (row + 0.5) * dy;
      const insideFir = pointInside([lat, lon], region.boundary);
      const weight = Math.cos(lat * DEG); // geographic cells do not have equal area
      if (insideFir) total += weight;
      const visibleTypes = new Set<Radar["type"]>();
      let missing = false;
      for (const radar of radars) {
        if (visibleTypes.has(radar.type)) continue;
        const visible = hasLineOfSight(t, values, radar, [lat, lon], altitude);
        if (visible) visibleTypes.add(radar.type);
        if (visible === null) missing = true;
        // Fusion requires a confirmed line of sight to both enabled surveillance types.
        if (visibleTypes.has("SSR") && visibleTypes.has("ADSB")) break;
      }
      const hit =
        visibleTypes.has("SSR") && visibleTypes.has("ADSB")
          ? "fusion"
          : visibleTypes.has("SSR")
            ? "SSR"
            : visibleTypes.has("ADSB")
              ? "ADSB"
              : visibleTypes.has("SMR")
                ? "SMR"
                : undefined;
      if (insideFir) {
        if (hit) covered += weight;
        else if (missing) unknown += weight;
      }
      // Missing DEM still affects FIR statistics, but is not drawn beyond available terrain.
      if (terrainMeters(t, values, [lat, lon]) === null || (!hit && !missing)) continue;
      const x = Math.max(t.minLon, west + col * dx),
        y = Math.max(t.minLat, south + row * dy),
        right = Math.min(t.maxLon, west + (col + 1) * dx),
        top = Math.min(t.maxLat, south + (row + 1) * dy);
      result.cells.features.push({
        type: "Feature",
        properties: { type: hit ?? "unknown" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [x, y],
              [right, y],
              [right, top],
              [x, top],
              [x, y],
            ],
          ],
        },
      });
    }
  // A single exact percentage is misleading when any sampled cell is unresolved.
  result.percentage = total && !unknown ? Math.round((covered / total) * 100) : null;
  result.unknownPercentage = total ? Math.round((unknown / total) * 100) : 0;
  return result;
}
