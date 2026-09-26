import { decodeDem, DEM_STEP, DemLoader, parseDemHeader, TiledElevation, tilesForBounds } from "./dem";
import { strToU8, zipSync } from "fflate";
import { expect, test, vi } from "vitest";

const headerText = `BYTEORDER M
LAYOUT BIL
NROWS 2
NCOLS 2
NBANDS 1
NBITS 16
BANDROWBYTES 4
TOTALROWBYTES 4
BANDGAPBYTES 0
NODATA -9999
ULXMAP ${DEM_STEP / 2}
ULYMAP ${10 - DEM_STEP / 2}
XDIM 0.00833333333333
YDIM 0.00833333333333`;
const requestUrl = (url: string | URL | Request) =>
  typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
const bytes = new Uint8Array(8);
[-50, 200, -9999, 3000].forEach((height, i) => new DataView(bytes.buffer).setInt16(i * 2, height, false));

test("decodes signed big-endian metres, preserves negative terrain and distinguishes nodata", () => {
  const header = parseDemHeader(headerText);
  const tile = decodeDem(header, bytes);
  expect([...tile.values]).toEqual([-50, 200, -9999, 3000]);
  const terrain = new TiledElevation([tile]);
  expect(terrain.elevation([header.north, header.west])).toBe(-50);
  expect(terrain.elevation([header.north, header.west + DEM_STEP])).toBe(200);
  expect(terrain.elevation([header.north - DEM_STEP, header.west])).toBeNull();
  expect(terrain.elevation([header.north - DEM_STEP, header.west + DEM_STEP])).toBe(3000);
  expect(terrain.elevation([10, 0])).toBe(-50);
  expect(terrain.elevation([10.001, 0])).toBeNull();
  expect(() => decodeDem(header, bytes.subarray(1))).toThrow();
  expect(() => parseDemHeader(headerText.replace("BYTEORDER M", "BYTEORDER I"))).toThrow();
  expect(() => parseDemHeader(headerText.replace("NODATA -9999", "NODATA 0"))).toThrow();
});
test("adjacent tiles share an edge without a half-cell shift", () => {
  const header = parseDemHeader(headerText);
  const left = { ...header, rows: 1, cols: 1200, values: new Int16Array(1200).fill(100) };
  const right = { ...header, west: 10 + DEM_STEP / 2, values: new Int16Array(4).fill(200) };
  const terrain = new TiledElevation([left, right]);
  expect(terrain.elevation([header.north, 10 - DEM_STEP / 2])).toBe(100);
  expect(terrain.elevation([header.north, 10])).toBe(200);
  expect(terrain.elevation([header.north, 10 + DEM_STEP / 2])).toBe(200);
  expect(tilesForBounds([99, 39, 111, 41]).sort()).toEqual([
    "e090n40",
    "e090n50",
    "e100n40",
    "e100n50",
    "e110n40",
    "e110n50",
  ]);
});
test("numeric tile lookup handles negative coordinates, latitude seams and cached misses", () => {
  const header = parseDemHeader(headerText);
  const north = { ...header, west: -10 + DEM_STEP / 2, rows: 1200, cols: 1, values: new Int16Array(1200).fill(100) };
  const south = { ...north, north: -DEM_STEP / 2, values: new Int16Array(1200).fill(200) };
  const terrain = new TiledElevation([north, south]);
  const lon = north.west;
  expect(terrain.elevation([DEM_STEP / 2, lon])).toBe(100);
  expect(terrain.elevation([0, lon])).toBe(200);
  expect(terrain.elevation([-DEM_STEP / 2, lon])).toBe(200);
  expect(terrain.elevation([-DEM_STEP / 2, 0])).toBeNull();
  expect(terrain.elevation([-DEM_STEP, 0])).toBeNull();
  expect(terrain.elevation([DEM_STEP / 2, lon])).toBe(100);
  expect(terrain.elevation([DEM_STEP / 2, lon + DEM_STEP])).toBeNull();
  expect(terrain.elevation([DEM_STEP / 2, lon])).toBe(100);
});
test("decompresses hosted ZIPs once and reuses tiles across bounds and altitude changes", async () => {
  const fetcher = vi.fn((url: string | URL | Request) =>
    Promise.resolve(
      new Response(
        new Uint8Array(
          zipSync(
            requestUrl(url).endsWith("hdr.zip") ? { "E000N10.HDR": strToU8(headerText) } : { "E000N10.DEM": bytes },
          ),
        ),
      ),
    ),
  );
  const loader = new DemLoader(fetcher);
  const [first, second] = await Promise.all([loader.load([0, 9, 1, 10]), loader.load([0, 8, 2, 10])]);
  expect(first.elevation([10 - DEM_STEP / 2, DEM_STEP / 2])).toBe(-50);
  expect(second.elevation([10 - DEM_STEP / 2, DEM_STEP / 2])).toBe(-50);
  expect(second).toBe(first);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[0][0]).toBe("https://files.vatprc.net/DEM/e000n10/e000n10.hdr.zip");
});
test("failed downloads are retryable and absent tiles never become sea level", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response("", { status: 503 }))
    .mockResolvedValue(new Response("", { status: 404 }));
  const loader = new DemLoader(fetcher);
  await expect(loader.load([0, 9, 1, 10])).rejects.toThrow("503");
  await expect(loader.load([0, 9, 1, 10])).rejects.toThrow("No DEM");
  await expect(loader.load([0, 9, 1, 10])).rejects.toThrow("No DEM");
  expect(fetcher).toHaveBeenCalledTimes(2);
});

test("default browser fetch is not invoked with a DemLoader receiver", async () => {
  const browserFetch = vi.fn(function (this: unknown, url: string | URL | Request) {
    if (this !== undefined && this !== globalThis) throw new TypeError("Illegal invocation");
    return Promise.resolve(
      new Response(
        new Uint8Array(
          zipSync(
            requestUrl(url).endsWith("hdr.zip") ? { "E000N10.HDR": strToU8(headerText) } : { "E000N10.DEM": bytes },
          ),
        ),
      ),
    );
  });
  vi.stubGlobal("fetch", browserFetch);
  try {
    const terrain = await new DemLoader().load([0, 9, 1, 10]);
    expect(terrain.elevation([10 - DEM_STEP / 2, DEM_STEP / 2])).toBe(-50);
    expect(browserFetch).toHaveBeenCalledTimes(2);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("direct raster sampling matches cell centres across tile seams and missing tiles", () => {
  const header = parseDemHeader(headerText);
  const tiles = [-10, 0].flatMap((west) =>
    [0, 10].map((north) => ({
      ...header,
      west: west + DEM_STEP / 2,
      north: north - DEM_STEP / 2,
      rows: 1200,
      cols: 1200,
      values: new Int16Array(1200 * 1200).fill(west + north - 20),
    })),
  );
  tiles[3].values[1199 * 1200] = -9999;
  const terrain = new TiledElevation(tiles);
  for (const x of [-1201, -1200, -1199, -1, 0, 1, 1199, 1200]) {
    for (const y of [-1201, -1200, -1199, -1, 0, 1, 1199, 1200]) {
      expect(terrain.elevationCell(x, y)).toBe(terrain.elevation([(y + 0.5) * DEM_STEP, (x + 0.5) * DEM_STEP]));
    }
  }
});
test("a changed set of loaded tiles gets a new terrain snapshot", async () => {
  const fetcher = vi.fn((url: string | URL | Request) =>
    Promise.resolve(
      new Response(
        new Uint8Array(
          zipSync(requestUrl(url).endsWith("hdr.zip") ? { "tile.hdr": strToU8(headerText) } : { "tile.dem": bytes }),
        ),
      ),
    ),
  );
  const loader = new DemLoader(fetcher, "https://example.test/", 1);
  const first = await loader.load([0, 9, 1, 10]);
  await loader.load([10, 9, 11, 10]);
  const reloaded = await loader.load([0, 9, 1, 10]);
  expect(reloaded).not.toBe(first);
  expect(fetcher).toHaveBeenCalledTimes(6);
});
