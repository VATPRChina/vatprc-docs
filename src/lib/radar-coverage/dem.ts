import { Coordinate } from "./types";
import { unzipSync } from "fflate";

export const DEM_URL = "https://files.vatprc.net/DEM/";
export const DEM_STEP = 1 / 120; // SRTM30, 30 arc seconds
export const DEM_NODATA = -9999;
export type Bounds = [number, number, number, number];
export interface DemHeader {
  rows: number;
  cols: number;
  west: number; // first cell centre, not the outer edge
  north: number;
  dx: number;
  dy: number;
}
export interface DemTile extends DemHeader {
  values: Int16Array;
}
export interface ElevationSource {
  elevation(point: Coordinate): number | null;
  step: number;
}
export function parseDemHeader(text: string): DemHeader {
  const fields = Object.fromEntries(
    text
      .trim()
      .split(/\r?\n/)
      .map((line) => line.trim().split(/\s+/)),
  );
  const number = (key: string) => Number(fields[key]);
  const rows = number("NROWS"),
    cols = number("NCOLS");
  const west = number("ULXMAP"),
    north = number("ULYMAP"),
    dx = number("XDIM"),
    dy = number("YDIM");
  if (
    fields.BYTEORDER !== "M" ||
    fields.LAYOUT !== "BIL" ||
    number("NBANDS") !== 1 ||
    number("NBITS") !== 16 ||
    number("NODATA") !== DEM_NODATA ||
    !Number.isInteger(rows) ||
    !Number.isInteger(cols) ||
    rows < 1 ||
    cols < 1 ||
    rows * cols > 30000000 ||
    ![west, north, dx, dy].every(Number.isFinite) ||
    Math.abs(dx - DEM_STEP) > 1e-10 ||
    Math.abs(dy - DEM_STEP) > 1e-10 ||
    number("BANDROWBYTES") !== cols * 2 ||
    number("TOTALROWBYTES") !== cols * 2 ||
    number("BANDGAPBYTES") !== 0
  ) {
    throw new Error("Unsupported DEM header");
  }
  // Reject misaligned tiles rather than silently offsetting the raster traversal grid.
  const aligned = (value: number) => Math.abs(value - Math.round(value)) < 1e-6;
  if (!aligned((west - dx / 2) / DEM_STEP) || !aligned((north + dy / 2) / DEM_STEP))
    throw new Error("Misaligned DEM grid");
  return { rows, cols, west, north, dx: DEM_STEP, dy: DEM_STEP };
}
export function decodeDem(header: DemHeader, bytes: Uint8Array): DemTile {
  if (bytes.byteLength !== header.rows * header.cols * 2) throw new Error("DEM byte count does not match header");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const values = new Int16Array(header.rows * header.cols);
  for (let i = 0; i < values.length; i++) values[i] = view.getInt16(i * 2, false);
  return { ...header, values };
}
function zipEntry(bytes: Uint8Array, extension: string): Uint8Array {
  const files = unzipSync(bytes, { filter: (file) => file.name.toLowerCase().endsWith(extension) });
  const entries = Object.values(files);
  if (entries.length !== 1) throw new Error(`Expected one ${extension} file`);
  return entries[0];
}
export function tileName(west: number, north: number): string {
  return `${west < 0 ? "w" : "e"}${Math.abs(west).toString().padStart(3, "0")}${north < 0 ? "s" : "n"}${Math.abs(north).toString().padStart(2, "0")}`;
}
export function tilesForBounds([west, south, east, north]: Bounds): string[] {
  const names: string[] = [];
  for (let x = Math.floor(west / 10) * 10; x < east; x += 10)
    for (let y = Math.ceil(north / 10) * 10; y > south; y -= 10) names.push(tileName(x, y));
  return names;
}
/** One loader lives in the persistent worker. Promise caching deduplicates overlapping requests. */
export class DemLoader {
  private cache = new Map<string, Promise<DemTile | null>>();
  constructor(
    private fetcher: typeof fetch = fetch,
    private baseUrl = DEM_URL,
    private capacity = 48,
  ) {}
  private tile(name: string): Promise<DemTile | null> {
    let promise = this.cache.get(name);
    if (!promise) {
      promise = this.download(name).catch((error: unknown) => {
        if (this.cache.get(name) === promise) this.cache.delete(name);
        throw error;
      });
    }
    this.cache.delete(name);
    this.cache.set(name, promise);
    // Bounded LRU; tiles used by the current calculation remain referenced by its sampler.
    while (this.cache.size > this.capacity) this.cache.delete(this.cache.keys().next().value!);
    return promise;
  }
  private async download(name: string): Promise<DemTile | null> {
    const headerResponse = await this.fetcher(`${this.baseUrl}${name}/${name}.hdr.zip`);
    if (headerResponse.status === 404) return null;
    if (!headerResponse.ok) throw new Error(`DEM header HTTP ${headerResponse.status}`);
    const header = parseDemHeader(
      new TextDecoder().decode(zipEntry(new Uint8Array(await headerResponse.arrayBuffer()), ".hdr")),
    );
    const demResponse = await this.fetcher(`${this.baseUrl}${name}/${name}.dem.zip`);
    if (!demResponse.ok) throw new Error(`DEM data HTTP ${demResponse.status}`);
    return decodeDem(header, zipEntry(new Uint8Array(await demResponse.arrayBuffer()), ".dem"));
  }
  async load(bounds: Bounds): Promise<TiledElevation> {
    const names = tilesForBounds(bounds);
    const tiles: DemTile[] = [];
    // Limit in-flight compressed data/decoding memory while sharing promises between FIRs.
    for (let i = 0; i < names.length; i += 4) {
      const batch = await Promise.all(names.slice(i, i + 4).map((name) => this.tile(name)));
      for (const tile of batch) if (tile) tiles.push(tile);
    }
    if (!tiles.length) throw new Error("No DEM tiles available for this region");
    return new TiledElevation(tiles);
  }
}
export class TiledElevation implements ElevationSource {
  readonly step = DEM_STEP;
  private index = new Map<string, DemTile>();
  constructor(tiles: DemTile[]) {
    for (const tile of tiles) {
      const west = tile.west - tile.dx / 2;
      const north = tile.north + tile.dy / 2;
      this.index.set(tileName(Math.round(west), Math.round(north)), tile);
    }
  }
  elevation([lat, lon]: Coordinate): number | null {
    const tile = this.index.get(tileName(Math.floor(lon / 10) * 10, Math.ceil(lat / 10) * 10));
    if (!tile) return null;
    const col = Math.floor((lon - (tile.west - tile.dx / 2)) / tile.dx + 1e-9);
    const row = Math.floor((tile.north + tile.dy / 2 - lat) / tile.dy + 1e-9);
    if (row < 0 || row >= tile.rows || col < 0 || col >= tile.cols) return null;
    const height = tile.values[row * tile.cols + col];
    return height === DEM_NODATA ? null : height;
  }
}

/** Supercover traversal: inspect each raster cell crossed by a short geographic segment. */
export function* traverseCells(
  a: Coordinate,
  b: Coordinate,
  step: number,
): Generator<{ point: Coordinate; fraction: number }> {
  const x0 = a[1] / step,
    y0 = a[0] / step,
    dx = (b[1] - a[1]) / step,
    dy = (b[0] - a[0]) / step;
  let x = Math.floor(x0),
    y = Math.floor(y0),
    start = 0;
  const sx = Math.sign(dx),
    sy = Math.sign(dy);
  let tx = dx === 0 ? Infinity : (x + (sx > 0 ? 1 : 0) - x0) / dx;
  let ty = dy === 0 ? Infinity : (y + (sy > 0 ? 1 : 0) - y0) / dy;
  const deltaX = dx === 0 ? Infinity : 1 / Math.abs(dx),
    deltaY = dy === 0 ? Infinity : 1 / Math.abs(dy);
  while (start < 1) {
    const end = Math.min(1, tx, ty);
    if (end > start) yield { point: [(y + 0.5) * step, (x + 0.5) * step], fraction: (start + end) / 2 };
    if (end >= 1) break;
    const crossX = tx <= ty,
      crossY = ty <= tx;
    if (crossX && crossY && end > 0) {
      yield { point: [(y + 0.5) * step, (x + sx + 0.5) * step], fraction: end };
      yield { point: [(y + sy + 0.5) * step, (x + 0.5) * step], fraction: end };
    }
    if (crossX) {
      x += sx;
      tx += deltaX;
    }
    if (crossY) {
      y += sy;
      ty += deltaY;
    }
    start = end;
  }
}
