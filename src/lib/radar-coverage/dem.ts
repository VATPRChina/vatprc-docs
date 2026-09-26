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
  /** Global raster indices: x increases east, y increases north; sample the cell centre. */
  elevationCell?(x: number, y: number): number | null;
  step: number;
}
export function parseDemHeader(text: string): DemHeader {
  const fields = Object.fromEntries(
    text
      .trim()
      .split(/\r?\n/)
      .map((line): [string, string] => {
        const [key, value] = line.trim().split(/\s+/);
        return [key, value];
      }),
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
  private lastTiles: DemTile[] = [];
  private lastTerrain?: TiledElevation;
  constructor(
    // Keep native fetch on its global receiver; calling this.fetcher = fetch
    // directly makes browsers reject the DemLoader receiver (Illegal invocation).
    private fetcher: typeof fetch = (...args) => globalThis.fetch(...args),
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
    // Preserve sampler identity only while the loaded tile objects are unchanged.
    // Failed downloads still retry above, and newly available tiles invalidate it.
    if (
      !this.lastTerrain ||
      tiles.length !== this.lastTiles.length ||
      tiles.some((tile, i) => tile !== this.lastTiles[i])
    ) {
      this.lastTiles = tiles;
      this.lastTerrain = new TiledElevation(tiles);
    }
    return this.lastTerrain;
  }
}
interface IndexedTile extends DemTile {
  westCell: number;
  northCell: number;
}
export class TiledElevation implements ElevationSource {
  readonly step = DEM_STEP;
  private index = new Map<number, Map<number, IndexedTile>>();
  private lastX = NaN;
  private lastY = NaN;
  private lastTile: IndexedTile | undefined;
  constructor(tiles: DemTile[]) {
    for (const tile of tiles) {
      const west = tile.west - tile.dx / 2;
      const north = tile.north + tile.dy / 2;
      const x = Math.round(west) / 10;
      const y = Math.round(north) / 10;
      let column = this.index.get(x);
      if (!column) this.index.set(x, (column = new Map<number, IndexedTile>()));
      column.set(y, { ...tile, westCell: Math.round(west / DEM_STEP), northCell: Math.round(north / DEM_STEP) });
    }
  }
  elevation([lat, lon]: Coordinate): number | null {
    // Successive samples on a ray usually stay in the same tile. Numeric keys
    // avoid formatting a filename for every elevation lookup, including misses.
    const x = Math.floor(lon / 10);
    const y = Math.ceil(lat / 10);
    if (x !== this.lastX || y !== this.lastY) {
      this.lastX = x;
      this.lastY = y;
      this.lastTile = this.index.get(x)?.get(y);
    }
    const tile = this.lastTile;
    if (!tile) return null;
    const col = Math.floor((lon - (tile.west - tile.dx / 2)) / tile.dx + 1e-9);
    const row = Math.floor((tile.north + tile.dy / 2 - lat) / tile.dy + 1e-9);
    if (row < 0 || row >= tile.rows || col < 0 || col >= tile.cols) return null;
    const height = tile.values[row * tile.cols + col];
    return height === DEM_NODATA ? null : height;
  }
  elevationCell(x: number, y: number): number | null {
    const tileX = Math.floor(x / 1200);
    const tileY = Math.floor(y / 1200) + 1;
    if (tileX !== this.lastX || tileY !== this.lastY) {
      this.lastX = tileX;
      this.lastY = tileY;
      this.lastTile = this.index.get(tileX)?.get(tileY);
    }
    const tile = this.lastTile;
    if (!tile) return null;
    const col = x - tile.westCell;
    const row = tile.northCell - y - 1;
    if (row < 0 || row >= tile.rows || col < 0 || col >= tile.cols) return null;
    const height = tile.values[row * tile.cols + col];
    return height === DEM_NODATA ? null : height;
  }
}

/** Visit global raster indices, including corner neighbours. False stops traversal. */
export function traverseCells(
  a: Coordinate,
  b: Coordinate,
  step: number,
  visit: (x: number, y: number, fraction: number) => boolean,
): boolean {
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
    if (end > start && !visit(x, y, (start + end) / 2)) return false;
    if (end >= 1) break;
    const crossX = tx <= ty,
      crossY = ty <= tx;
    if (crossX && crossY && end > 0) {
      if (!visit(x + sx, y, end)) return false;
      if (!visit(x, y + sy, end)) return false;
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
  return true;
}
