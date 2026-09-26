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
function greatCircleInterpolator(a: Coordinate, b: Coordinate, angle: number): (fraction: number) => Coordinate {
  // These terms are constant for the whole ray, which can span hundreds of segments.
  const sinAngle = Math.sin(angle);
  const cosLatA = Math.cos(a[0] * DEG),
    cosLonA = Math.cos(a[1] * DEG),
    sinLonA = Math.sin(a[1] * DEG);
  const cosLatB = Math.cos(b[0] * DEG),
    cosLonB = Math.cos(b[1] * DEG),
    sinLonB = Math.sin(b[1] * DEG);
  const sinLatA = Math.sin(a[0] * DEG),
    sinLatB = Math.sin(b[0] * DEG);
  return (fraction) => {
    if (angle < 1e-10) return a;
    const first = Math.sin((1 - fraction) * angle) / sinAngle,
      second = Math.sin(fraction * angle) / sinAngle;
    const x = first * cosLatA * cosLonA + second * cosLatB * cosLonB;
    const y = first * cosLatA * sinLonA + second * cosLatB * sinLonB;
    const z = first * sinLatA + second * sinLatB;
    return [Math.atan2(z, Math.hypot(x, y)) / DEG, Math.atan2(y, x) / DEG];
  };
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
  const station = stationGround === null ? null : Math.max(radar.elevation, stationGround * 3.28084);
  return lineOfSight(terrain, stationPoint, target, altitude, distance, targetGround, station);
}
function lineOfSight(
  terrain: ElevationSource,
  stationPoint: Coordinate,
  target: Coordinate,
  altitude: number,
  distance: number,
  targetGround: number | null,
  station: number | null,
): boolean | null {
  if (targetGround === null || station === null) return null;
  if (altitude <= targetGround * 3.28084) return false;
  if (distance < 0.01) return true;
  const distanceFt = distance * FT_PER_NM;
  const targetSlope = (altitude - station) / distanceFt - distanceFt / (2 * EFFECTIVE_EARTH_FT);
  // Approximate the great-circle with short segments, then traverse every raster cell
  // crossed by each segment. The interval scales to the DEM, not the map zoom.
  const segmentLength = Math.min(1, terrain.step * DEG * EARTH_NM);
  const steps = Math.max(1, Math.ceil(distance / segmentLength));
  const interpolate = greatCircleInterpolator(stationPoint, target, distance / EARTH_NM);
  let missing = false;
  let previous = stationPoint;
  let i = 1;
  // Reuse one visitor for the ray; the hot traversal need not allocate a
  // generator result, cell object and coordinate array for each crossed cell.
  const samplePoint: Coordinate = [0, 0];
  const sampleCell = terrain.elevationCell
    ? terrain.elevationCell.bind(terrain)
    : (x: number, y: number) => {
        samplePoint[0] = (y + 0.5) * terrain.step;
        samplePoint[1] = (x + 0.5) * terrain.step;
        return terrain.elevation(samplePoint);
      };
  const visit = (x: number, y: number, cellFraction: number): boolean => {
    const fraction = (i - 1 + cellFraction) / steps;
    if (fraction <= 1e-8 || fraction >= 1 - 1e-8) return true;
    const sample = sampleCell(x, y);
    if (sample === null) {
      missing = true;
      return true;
    }
    const sampleFt = distanceFt * fraction;
    const slope = (sample * 3.28084 - station) / sampleFt - sampleFt / (2 * EFFECTIVE_EARTH_FT);
    return !(slope > targetSlope + 1e-6);
  };
  for (; i <= steps; i++) {
    const next = interpolate(i / steps);
    if (!traverseCells(previous, next, terrain.step, visit)) return false;
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

/** One current grid per worker. Terrain sources must be immutable snapshots. */
export class CoverageCache {
  private key = "";
  private terrain?: ElevationSource;
  private grid?: CoverageGrid;
  get(region: RadarRegion, terrain: ElevationSource): CoverageGrid {
    // Worker messages clone region objects, so reference equality is insufficient.
    // Altitude and enabled sources do not affect the grid or station geometry.
    const key = JSON.stringify([region.boundary, region.radars]);
    if (!this.grid || this.key !== key || this.terrain !== terrain) {
      this.key = key;
      this.terrain = terrain;
      this.grid = new CoverageGrid(region, terrain);
    }
    return this.grid;
  }
}
class CoverageGrid {
  readonly cols = 300;
  readonly rows: number;
  readonly west: number;
  readonly south: number;
  readonly dx: number;
  readonly dy: number;
  readonly longitudes: Float64Array;
  readonly latitudes: Float64Array;
  readonly weights: Float64Array;
  readonly inside: Int8Array;
  readonly ground: Float64Array;
  readonly corners: Uint8Array;
  readonly stations: { radar: Radar; point: Coordinate; height: number | null }[];
  private distances = new Map<number, Float64Array>();
  private distanceBytes = 0;
  constructor(region: RadarRegion, terrain: ElevationSource) {
    const [west, south, east, north] = coverageBounds(region) ?? [0, 0, 0, 0];
    this.west = west;
    this.south = south;
    this.rows =
      east === west ? 0 : Math.min(320, Math.max(140, Math.round((this.cols * (north - south)) / (east - west))));
    this.dx = (east - west) / this.cols;
    this.dy = this.rows ? (north - south) / this.rows : 0;
    this.longitudes = Float64Array.from({ length: this.cols }, (_, col) => west + (col + 0.5) * this.dx);
    this.latitudes = Float64Array.from({ length: this.rows }, (_, row) => south + (row + 0.5) * this.dy);
    this.weights = this.latitudes.map((lat) => Math.cos(lat * DEG));
    const size = this.cols * this.rows;
    // Fill cells lazily during row iteration, preserving cancellation while preparing a grid.
    this.inside = new Int8Array(size).fill(-1);
    this.ground = new Float64Array(size);
    this.corners = new Uint8Array(size);
    this.stations = region.radars.map((radar) => {
      const point: Coordinate = [radar.lat, radar.lon];
      const ground = terrain.elevation(point);
      return { radar, point, height: ground === null ? null : Math.max(radar.elevation, ground * 3.28084) };
    });
  }
  distancesFor(station: number): Float64Array | undefined {
    let distances = this.distances.get(station);
    const bytes = this.inside.length * Float64Array.BYTES_PER_ELEMENT;
    // Bound memory even for large imported station lists. Uncached pairs compute normally.
    if (!distances && this.distanceBytes + bytes <= 32 * 1024 * 1024) {
      distances = new Float64Array(this.inside.length).fill(-1);
      this.distances.set(station, distances);
      this.distanceBytes += bytes;
    }
    return distances;
  }
}

function* coverageRows(
  { region, altitude, enabled }: CoverageRequest,
  terrain: ElevationSource,
  cache?: CoverageCache,
): Generator<void, CoverageResult> {
  const grid = cache ? cache.get(region, terrain) : new CoverageGrid(region, terrain);
  const result: CoverageResult = {
    cells: { type: "FeatureCollection", features: [] },
    percentage: null,
    unknownPercentage: 0,
    stationHeights: grid.stations.map((station) => station.height),
  };
  if (!grid.rows || !region.radars.length) return result;
  const radars = grid.stations.flatMap((station, index) =>
    enabled.includes(station.radar.type)
      ? [{ ...station, distances: cache ? grid.distancesFor(index) : undefined }]
      : [],
  );
  const { west, south, cols, rows, dx, dy } = grid;
  let total = 0,
    covered = 0,
    unknown = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const lon = grid.longitudes[col],
        lat = grid.latitudes[row];
      const target: Coordinate = [lat, lon];
      if (grid.inside[index] === -1) {
        grid.inside[index] = pointInside(target, region.boundary) ? 1 : 0;
        grid.ground[index] = terrain.elevation(target) ?? NaN;
      }
      const targetGround = Number.isNaN(grid.ground[index]) ? null : grid.ground[index];
      const insideFir = grid.inside[index] === 1;
      const weight = grid.weights[row]; // geographic cells do not have equal area
      if (insideFir) total += weight;
      const visibleTypes = new Set<Radar["type"]>();
      let missing = false;
      for (const { radar, point, height, distances } of radars) {
        if (visibleTypes.has(radar.type)) continue;
        let distance = distances?.[index] ?? -1;
        if (distance < 0) {
          distance = distanceNm(point, target);
          if (distances) distances[index] = distance;
        }
        const visible =
          distance > radar.maxRange
            ? false
            : lineOfSight(terrain, point, target, altitude, distance, targetGround, height);
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
      if (targetGround === null || (!hit && !missing)) continue;
      const x = west + col * dx,
        y = south + row * dy,
        right = west + (col + 1) * dx,
        top = south + (row + 1) * dy;
      if (!grid.corners[index]) {
        grid.corners[index] = [
          [y, x],
          [top, x],
          [top, right],
          [y, right],
        ].some(([lat, lon]) => terrain.elevation([lat, lon]) === null)
          ? 1
          : 2;
      }
      if (grid.corners[index] === 1) continue;
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
export function calculateCoverage(
  request: CoverageRequest,
  terrain: ElevationSource,
  cache?: CoverageCache,
): CoverageResult {
  const rows = coverageRows(request, terrain, cache);
  let step = rows.next();
  while (!step.done) step = rows.next();
  return step.value;
}
/** Yield between rows so the persistent worker can cancel stale jobs without losing DEM cache. */
export async function calculateCoverageAsync(
  request: CoverageRequest,
  terrain: ElevationSource,
  cancelled: () => boolean,
  cache?: CoverageCache,
): Promise<CoverageResult | null> {
  const rows = coverageRows(request, terrain, cache);
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
