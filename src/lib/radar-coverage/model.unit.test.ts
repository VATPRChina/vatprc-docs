import { DEM_STEP, ElevationSource, TiledElevation, traverseCells } from "./dem";
import {
  calculateCoverage,
  calculateCoverageAsync,
  CoverageCache,
  distanceNm,
  hasLineOfSight,
  pointInside,
} from "./model";
import { Coordinate, Radar, RadarRegion } from "./types";
import { deepStrictEqual } from "node:assert";
import { expect, test } from "vitest";

const radar: Radar = { name: "Test", type: "SSR", elevation: 100, maxRange: 2, lat: 0.01, lon: 0.01 };
const region: RadarRegion = {
  code: "TEST",
  name: "Test",
  boundary: [
    [0.005, 0.005],
    [0.005, 0.015],
    [0.015, 0.015],
    [0.015, 0.005],
  ],
  radars: [radar],
};
const flat: ElevationSource = {
  step: DEM_STEP,
  elevation: ([lat, lon]) => (Math.abs(lat) <= 0.05 && Math.abs(lon) <= 0.05 ? 0 : null),
};

test("great-circle distance is in nautical miles", () => {
  expect(distanceNm([0, 0], [0, 1])).toBeCloseTo(60.04, 1);
});
test("range, terrain, curvature and missing data constrain visibility", () => {
  expect(hasLineOfSight(flat, radar, [0.015, 0.015], 10000)).toBe(true);
  expect(hasLineOfSight(flat, radar, [0.01, 1], 10000)).toBe(false);
  expect(hasLineOfSight(flat, radar, [0.015, 0.015], 0)).toBe(false);
  expect(hasLineOfSight({ step: DEM_STEP, elevation: () => null }, radar, [0.015, 0.015], 10000)).toBeNull();
  expect(hasLineOfSight({ step: DEM_STEP, elevation: () => 0 }, { ...radar, maxRange: 200 }, [0.01, 2], 100)).toBe(
    false,
  );
});
test("raster traversal checks diagonal corner neighbours and reversed paths", () => {
  const collect = (a: Coordinate, b: Coordinate) => {
    const cells: string[] = [];
    expect(
      traverseCells(a, b, 1, (x, y) => {
        cells.push([y + 0.5, x + 0.5].join());
        return true;
      }),
    ).toBe(true);
    return cells;
  };
  const cells = collect([0.1, 0.1], [2.9, 2.9]);
  expect(cells).toContain("0.5,1.5");
  expect(cells).toContain("1.5,0.5");
  expect(new Set(collect([2.9, 2.9], [0.1, 0.1]))).toEqual(new Set(cells));
});
test("raster traversal preserves sample fractions and stops immediately at an obstruction", () => {
  const samples: number[][] = [];
  expect(
    traverseCells([0.5, 0.5], [0.5, 2.5], 1, (x, y, fraction) => {
      samples.push([y + 0.5, x + 0.5, fraction]);
      return true;
    }),
  ).toBe(true);
  expect(samples).toEqual([
    [0.5, 0.5, 0.125],
    [0.5, 1.5, 0.5],
    [0.5, 2.5, 0.875],
  ]);
  let visits = 0;
  expect(traverseCells([0.1, 0.1], [2.9, 2.9], 1, () => ++visits < 2)).toBe(false);
  expect(visits).toBe(2);
});
test("missing terrain on a ray stays unknown unless an obstruction is found", () => {
  const station = { ...radar, maxRange: 20 };
  const missing: ElevationSource = {
    step: DEM_STEP,
    elevation: ([, lon]) => (lon >= DEM_STEP * 2 && lon < DEM_STEP * 3 ? null : 0),
  };
  expect(hasLineOfSight(missing, station, [0.01, 0.09], 10000)).toBeNull();
  const ridge: ElevationSource = {
    step: DEM_STEP,
    elevation: (point) => (point[1] >= DEM_STEP * 5 && point[1] < DEM_STEP * 6 ? 5000 : missing.elevation(point)),
  };
  expect(hasLineOfSight(ridge, station, [0.01, 0.09], 10000)).toBe(false);
});
test("a narrow 30-arc-second ridge is detected between one-NM samples", () => {
  const ridge: ElevationSource = {
    step: DEM_STEP,
    elevation: ([, lon]) => (lon >= DEM_STEP * 2 && lon < DEM_STEP * 3 ? 5000 : 0),
  };
  expect(hasLineOfSight(ridge, { ...radar, maxRange: 20 }, [0.01, 0.09], 10000)).toBe(false);
});
test("direct raster rays agree with geographic sampling for ridges and missing terrain", () => {
  const values = new Int16Array(1200 * 1200);
  for (let row = 0; row < 1200; row++) {
    values[row * 1200 + 2] = -9999;
    values[row * 1200 + 5] = 5000;
  }
  const terrain = new TiledElevation([
    {
      rows: 1200,
      cols: 1200,
      west: DEM_STEP / 2,
      north: 10 - DEM_STEP / 2,
      dx: DEM_STEP,
      dy: DEM_STEP,
      values,
    },
  ]);
  const geographic = { step: terrain.step, elevation: (point: Coordinate) => terrain.elevation(point) };
  const station = { ...radar, maxRange: 20 };
  for (const altitude of [0, 3000, 10000, 30000]) {
    for (const target of [
      [0.01, 0.09],
      [0.01, 0.03],
      [0.01, 0.015],
    ] as Coordinate[]) {
      expect(hasLineOfSight(terrain, station, target, altitude)).toBe(
        hasLineOfSight(geographic, station, target, altitude),
      );
    }
  }
});
test("fusion is order independent and disabling a source restores single-source coverage", () => {
  const adsb: Radar = { ...radar, type: "ADSB" };
  for (const radars of [
    [radar, adsb],
    [adsb, radar],
  ]) {
    const result = calculateCoverage(
      { region: { ...region, radars }, altitude: 10000, enabled: ["SSR", "ADSB"] },
      flat,
    );
    expect(result.percentage).toBe(100);
    expect(new Set(result.cells.features.map((f) => f.properties.type))).toEqual(new Set(["fusion"]));
  }
  const result = calculateCoverage(
    { region: { ...region, radars: [radar, adsb] }, altitude: 10000, enabled: ["ADSB"] },
    flat,
  );
  expect(new Set(result.cells.features.map((f) => f.properties.type))).toEqual(new Set(["ADSB"]));
});
test("coverage extends outside FIR but not outside DEM, while statistics remain FIR-only", () => {
  const result = calculateCoverage({ region, altitude: 10000, enabled: ["SSR"] }, flat);
  expect(result.percentage).toBe(100);
  expect(
    result.cells.features.some((f) => {
      const [lon, lat] = f.geometry.coordinates[0][0];
      return !pointInside([lat, lon], region.boundary);
    }),
  ).toBe(true);
  expect(
    result.cells.features.every((f) =>
      f.geometry.coordinates[0].every(([lon, lat]) => flat.elevation([lat, lon]) !== null),
    ),
  ).toBe(true);
  expect(calculateCoverage({ region, altitude: 10000, enabled: [] }, flat).cells.features).toEqual([]);
  expect(
    calculateCoverage({ region, altitude: 10000, enabled: ["SSR"] }, { step: DEM_STEP, elevation: () => null })
      .percentage,
  ).toBeNull();
});
test("stale calculations can be cancelled without terminating the worker", async () => {
  expect(await calculateCoverageAsync({ region, altitude: 10000, enabled: ["SSR"] }, flat, () => true)).toBeNull();
});

test("grid cache reuses terrain samples across cloned regions and altitude changes", () => {
  let samples = 0;
  const elevation = (point: Coordinate) => {
    samples++;
    return flat.elevation(point);
  };
  const terrain = { step: DEM_STEP, elevation };
  const cache = new CoverageCache();
  calculateCoverage({ region, altitude: 0, enabled: [] }, terrain, cache);
  expect(samples).toBeGreaterThan(1000);
  samples = 0;
  calculateCoverage({ region: structuredClone(region), altitude: 30000, enabled: [] }, terrain, cache);
  expect(samples).toBe(0);
  for (const altitude of [0, 3000, 10000]) {
    for (const enabled of [[], ["SSR"], ["ADSB"]] as ("SSR" | "ADSB")[][]) {
      const request = { region: structuredClone(region), altitude, enabled };
      deepStrictEqual(calculateCoverage(request, terrain, cache), calculateCoverage(request, terrain));
    }
  }
});
test.each(["boundary", "station position", "station range", "terrain"] as const)(
  "grid cache invalidates a changed %s and can restore the original snapshot",
  (change) => {
    const cache = new CoverageCache();
    const original = { region, altitude: 10000, enabled: ["SSR"] as "SSR"[] };
    const expected = calculateCoverage(original, flat, cache);
    const changed = { ...original, region: structuredClone(region) };
    let terrain: ElevationSource = flat;
    if (change === "boundary") changed.region.boundary[0][0] += 0.005;
    if (change === "station position") changed.region.radars[0].lat += 0.01;
    if (change === "station range") changed.region.radars[0].maxRange = 1;
    if (change === "terrain") terrain = { step: DEM_STEP, elevation: () => null };
    deepStrictEqual(calculateCoverage(changed, terrain, cache), calculateCoverage(changed, terrain));
    deepStrictEqual(calculateCoverage(original, flat, cache), expected);
  },
);
test("a cancelled partial grid can be safely reused by the next request", async () => {
  const cache = new CoverageCache();
  const request = { region, altitude: 10000, enabled: ["SSR"] as "SSR"[] };
  expect(await calculateCoverageAsync(request, flat, () => true, cache)).toBeNull();
  deepStrictEqual(await calculateCoverageAsync(request, flat, () => false, cache), calculateCoverage(request, flat));
});
