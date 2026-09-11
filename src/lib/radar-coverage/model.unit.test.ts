import { loadRegion, parseRadarData } from "./data";
import { parseDataset } from "./import";
import { calculateCoverage, decodeTerrain, distanceNm, hasLineOfSight, pointInside, terrainMeters } from "./model";
import { CoverageResult, Radar, RadarRegion, Terrain } from "./types";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

function grid(height = 0): Terrain {
  const values = new Uint8Array(21 * 21 * 2);
  const view = new DataView(values.buffer);
  for (let i = 0; i < 21 * 21; i++) view.setInt16(i * 2, height, true);
  return {
    minLat: -1,
    maxLat: 1,
    minLon: -1,
    maxLon: 1,
    step: 0.1,
    rows: 21,
    cols: 21,
    values: Buffer.from(values).toString("base64"),
  };
}
const radar: Radar = { name: "Test", type: "SSR", elevation: 100, maxRange: 100, lat: 0, lon: -0.5 };
const region: RadarRegion = {
  code: "TEST",
  name: "Test",
  boundary: [
    [-0.1, -0.1],
    [-0.1, 0.1],
    [0.1, 0.1],
    [0.1, -0.1],
  ],
  radars: [radar],
  terrain: grid(),
};

function firTypes(result: CoverageResult) {
  return new Set(
    result.cells.features
      .filter((f) => {
        const ring = f.geometry.coordinates[0];
        return pointInside([(ring[0][1] + ring[2][1]) / 2, (ring[0][0] + ring[2][0]) / 2], region.boundary);
      })
      .map((f) => f.properties.type),
  );
}

test("all nine supplied datasets validate, with SSR_ModeC retained as SSR surveillance", () => {
  const regions = parseRadarData(readFileSync("assets/radar-data.js", "utf8"));
  expect(regions).toHaveLength(9);
  let total = 0;
  for (const data of regions) {
    total += data.radars.length;
    expect(data.radars.some((r) => r.type === "SSR")).toBe(true);
    expect(data.terrain).toBeDefined();
    expect(decodeTerrain(data.terrain!).length).toBe(data.terrain!.rows * data.terrain!.cols);
  }
  expect(total).toBe(688);
});
test("distance uses nautical miles", () => {
  expect(distanceNm([0, 0], [0, 1])).toBeCloseTo(60.04, 1);
});
test("DEM decodes little endian and retains negative elevations", () => {
  const t = grid(-50),
    values = decodeTerrain(t);
  expect(terrainMeters(t, values, [0, 0])).toBe(-50);
  expect(terrainMeters(t, values, [2, 0])).toBeNull();
  values[10 * 21 + 10] = -32768;
  expect(terrainMeters(t, values, [0, 0])).toBeNull();
});
test("line of sight respects range, Earth curvature, target terrain and ridges", () => {
  const t = grid(),
    values = decodeTerrain(t);
  expect(hasLineOfSight(t, values, radar, [0, 0.5], 10000)).toBe(true);
  expect(hasLineOfSight(t, values, radar, [0, 0.5], 100)).toBe(false);
  expect(hasLineOfSight(t, values, { ...radar, maxRange: 1 }, [0, 0.5], 10000)).toBe(false);
  expect(hasLineOfSight(t, values, radar, [0, 0.5], 0)).toBe(false);
  for (let row = 0; row < 21; row++) values[row * 21 + 10] = 5000;
  expect(hasLineOfSight(t, values, radar, [0, 0.5], 10000)).toBe(false);
});
test("missing terrain is unknown, never sea level", () => {
  const t = grid();
  expect(hasLineOfSight(t, decodeTerrain(t), { ...radar, lon: -2, maxRange: 200 }, [0, 0], 10000)).toBeNull();
  expect(
    calculateCoverage({ region: { ...region, terrain: undefined }, altitude: 10000, enabled: ["SSR"] }).percentage,
  ).toBeNull();
});
test("coverage recomputes for altitude, disabled sources and changed files", () => {
  expect(calculateCoverage({ region, altitude: 10000, enabled: ["SSR"] }).percentage).toBe(100);
  expect(calculateCoverage({ region, altitude: 0, enabled: ["SSR"] }).percentage).toBe(0);
  expect(calculateCoverage({ region, altitude: 10000, enabled: [] }).percentage).toBe(0);
  expect(
    calculateCoverage({ region: { ...region, radars: [{ ...radar, maxRange: 1 }] }, altitude: 10000, enabled: ["SSR"] })
      .percentage,
  ).toBe(0);
  const unknown = calculateCoverage({
    region: { ...region, radars: [{ ...radar, lon: -2, maxRange: 200 }] },
    altitude: 10000,
    enabled: ["SSR"],
  });
  expect(unknown.percentage).toBeNull();
  expect(unknown.unknownPercentage).toBe(100);
});
test("dataset parser rejects invalid terrain dimensions and missing radar coordinates", () => {
  expect(() => parseDataset(JSON.stringify({ TEST: { ...region, terrain: { ...grid(), rows: 10 } } }))).toThrow();
  expect(() => parseDataset(JSON.stringify({ TEST: { ...region, radars: [{ ...radar, lat: null }] } }))).toThrow();
  expect(() => parseDataset("window.RADAR_DATA={}")).toThrow();
});

test("the built-in loader supplies visible coverage for both default surveillance sources", async () => {
  const data = await loadRegion("ZBPE");
  for (const type of ["SSR", "ADSB"] as const) {
    const result = calculateCoverage({ region: data, altitude: 10000, enabled: [type] });
    expect(result.cells.features.some((feature) => feature.properties.type === type)).toBe(true);
  }
  expect(calculateCoverage({ region: data, altitude: 10000, enabled: [] }).cells.features).toEqual([]);
});

test("fusion requires SSR and ADS-B coverage and is independent of radar order", () => {
  const adsb: Radar = { ...radar, name: "ADS-B", type: "ADSB" };
  for (const radars of [
    [radar, adsb],
    [adsb, radar],
  ]) {
    const result = calculateCoverage({ region: { ...region, radars }, altitude: 10000, enabled: ["SSR", "ADSB"] });
    expect(result.percentage).toBe(100);
    expect(firTypes(result)).toEqual(new Set(["fusion"]));
  }
  for (const type of ["SSR", "ADSB"] as const) {
    const result = calculateCoverage({
      region: { ...region, radars: [radar, adsb] },
      altitude: 10000,
      enabled: [type],
    });
    expect(firTypes(result)).toEqual(new Set([type]));
  }
});

test("out-of-range, unknown ADS-B terrain and SMR do not count as fusion", () => {
  for (const extra of [
    { ...radar, type: "ADSB" as const, maxRange: 1 },
    { ...radar, type: "ADSB" as const, lon: -2, maxRange: 200 },
    { ...radar, type: "SMR" as const },
  ]) {
    const result = calculateCoverage({
      region: { ...region, radars: [extra, radar] },
      altitude: 10000,
      enabled: ["SSR", "ADSB", "SMR"],
    });
    expect(result.percentage).toBe(100);
    expect(firTypes(result)).toEqual(new Set(["SSR"]));
  }
});

test("coverage extends beyond the FIR but all displayed cells stay inside available DEM", () => {
  const result = calculateCoverage({ region, altitude: 10000, enabled: ["SSR"] });
  expect(result.percentage).toBe(100);
  expect(result.unknownPercentage).toBe(0);
  expect(
    result.cells.features.some((f) => {
      const [lon, lat] = f.geometry.coordinates[0][0];
      return !pointInside([lat, lon], region.boundary) && f.properties.type === "SSR";
    }),
  ).toBe(true);
  expect(result.cells.features.some((f) => f.properties.type === "unknown")).toBe(false);
  expect(
    result.cells.features.every((feature) =>
      feature.geometry.coordinates[0].every(
        ([lon, lat]) =>
          lon >= region.terrain!.minLon &&
          lon <= region.terrain!.maxLon &&
          lat >= region.terrain!.minLat &&
          lat <= region.terrain!.maxLat,
      ),
    ),
  ).toBe(true);
});

test("one-NM path sampling detects a narrow ridge between the previous three-NM samples", () => {
  const t: Terrain = {
    minLat: -0.01,
    maxLat: 0.01,
    minLon: -0.1,
    maxLon: 0.1,
    step: 0.005,
    rows: 5,
    cols: 41,
    values: "",
  };
  const values = new Int16Array(t.rows * t.cols);
  const station = { ...radar, lon: -0.08 };
  expect(hasLineOfSight(t, values, station, [0, 0.08], 10000)).toBe(true);
  for (let row = 0; row < t.rows; row++) values[row * t.cols + 7] = 5000;
  expect(hasLineOfSight(t, values, station, [0, 0.08], 10000)).toBe(false);
});
