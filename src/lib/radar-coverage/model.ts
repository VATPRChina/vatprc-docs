import { DEM_NODATA, ElevationSource, traverseCells } from "./dem";
import { Coordinate, CoverageRequest, CoverageResult, Radar, RadarRegion } from "./types";

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
  terrain: ElevationSource,
  radar: Radar,
  target: Coordinate,
  altitude: number,
): boolean | null {
  const stationPoint: Coordinate = [radar.lat, radar.lon];
  const distance = distanceNm(stationPoint, target);
  if (distance > radar.maxRange) return false;
  const targetGround = terrain.elevation(target),
    stationGround = terrain.elevation(stationPoint);
  if (targetGround === null || stationGround === null) return null;
  if (altitude <= targetGround * 3.28084) return false;
  if (distance < 0.01) return true;
  const station = Math.max(radar.elevation, stationGround * 3.28084);
  const distanceFt = distance * FT_PER_NM;
  const targetSlope = (altitude - station) / distanceFt - distanceFt / (2 * EFFECTIVE_EARTH_FT);
  // Approximate the great-circle with short segments, then traverse every raster cell
  // crossed by each segment. The interval scales to the DEM, not the map zoom.
  const segmentLength = Math.min(1, terrain.step * DEG * EARTH_NM);
  const steps = Math.max(1, Math.ceil(distance / segmentLength));
  let missing = false;
  let previous = stationPoint;
  for (let i = 1; i <= steps; i++) {
    const next = interpolate(stationPoint, target, i / steps, distance / EARTH_NM);
    for (const cell of traverseCells(previous, next, terrain.step)) {
      const fraction = (i - 1 + cell.fraction) / steps;
      if (fraction <= 1e-8 || fraction >= 1 - 1e-8) continue;
      const sample = terrain.elevation(cell.point);
      if (sample === null) {
        missing = true;
        continue;
      }
      const sampleFt = distanceFt * fraction;
      const slope = (sample * 3.28084 - station) / sampleFt - sampleFt / (2 * EFFECTIVE_EARTH_FT);
      if (slope > targetSlope + 1e-6) return false;
    }
    previous = next;
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

function* coverageRows(
  { region, altitude, enabled }: CoverageRequest,
  terrain: ElevationSource,
): Generator<void, CoverageResult> {
  const result: CoverageResult = {
    cells: { type: "FeatureCollection", features: [] },
    percentage: null,
    unknownPercentage: 0,
    stationHeights: region.radars.map((radar) => {
      const ground = terrain.elevation([radar.lat, radar.lon]);
      return ground === null ? null : Math.max(radar.elevation, ground * 3.28084);
    }),
  };
  const bounds = coverageBounds(region);
  if (!bounds || !region.radars.length) return result;
  const radars = region.radars.filter((r) => enabled.includes(r.type));
  const [west, south, east, north] = bounds;
  const cols = 300,
    rows = Math.min(320, Math.max(140, Math.round((cols * (north - south)) / (east - west))));
  const dx = (east - west) / cols,
    dy = (north - south) / rows;
  let total = 0,
    covered = 0,
    unknown = 0;
  for (let row = 0; row < rows; row++) {
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
        const visible = hasLineOfSight(terrain, radar, [lat, lon], altitude);
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
      if (terrain.elevation([lat, lon]) === null || (!hit && !missing)) continue;
      const x = west + col * dx,
        y = south + row * dy,
        right = west + (col + 1) * dx,
        top = south + (row + 1) * dy;
      if (
        [
          [y, x],
          [top, x],
          [top, right],
          [y, right],
        ].some(([lat, lon]) => terrain.elevation([lat, lon]) === null)
      )
        continue;
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
    yield;
  }
  // A single exact percentage is misleading when any sampled cell is unresolved.
  result.percentage = total && !unknown ? Math.round((covered / total) * 100) : null;
  result.unknownPercentage = total ? Math.round((unknown / total) * 100) : 0;
  return result;
}

/** Synchronous entry point for deterministic model tests. */
export function calculateCoverage(request: CoverageRequest, terrain: ElevationSource): CoverageResult {
  const rows = coverageRows(request, terrain);
  let step = rows.next();
  while (!step.done) step = rows.next();
  return step.value;
}
/** Yield between rows so the persistent worker can cancel stale jobs without losing DEM cache. */
export async function calculateCoverageAsync(
  request: CoverageRequest,
  terrain: ElevationSource,
  cancelled: () => boolean,
): Promise<CoverageResult | null> {
  const rows = coverageRows(request, terrain);
  let step = rows.next();
  let count = 0;
  while (!step.done) {
    if (++count % 2 === 0) await new Promise<void>((resolve) => setTimeout(resolve, 0));
    if (cancelled()) return null;
    step = rows.next();
  }
  return step.value;
}
export function terrainPreview(
  region: RadarRegion,
  terrain: ElevationSource,
): NonNullable<CoverageResult["terrain"]> | undefined {
  const bounds = coverageBounds(region);
  if (!bounds) return undefined;
  const [minLon, minLat, maxLon, maxLat] = bounds;
  const cols = 240,
    rows = 240;
  const values = new Int16Array(rows * cols);
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) {
      values[row * cols + col] =
        terrain.elevation([
          maxLat - ((row + 0.5) * (maxLat - minLat)) / rows,
          minLon + ((col + 0.5) * (maxLon - minLon)) / cols,
        ]) ?? DEM_NODATA;
    }
  return { minLon, minLat, maxLon, maxLat, rows, cols, values };
}
