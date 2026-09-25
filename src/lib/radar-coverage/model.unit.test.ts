import { DEM_STEP, ElevationSource, traverseCells } from "./dem";
import { calculateCoverage, calculateCoverageAsync, distanceNm, hasLineOfSight, pointInside } from "./model";
import { Radar, RadarRegion } from "./types";
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
  const cells = [...traverseCells([0.1, 0.1], [2.9, 2.9], 1)].map((s) => s.point.join());
  expect(cells).toContain("0.5,1.5");
  expect(cells).toContain("1.5,0.5");
  expect(new Set([...traverseCells([2.9, 2.9], [0.1, 0.1], 1)].map((s) => s.point.join()))).toEqual(new Set(cells));
});
test("a narrow 30-arc-second ridge is detected between one-NM samples", () => {
  const ridge: ElevationSource = {
    step: DEM_STEP,
    elevation: ([, lon]) => (lon >= DEM_STEP * 2 && lon < DEM_STEP * 3 ? 5000 : 0),
  };
  expect(hasLineOfSight(ridge, { ...radar, maxRange: 20 }, [0.01, 0.09], 10000)).toBe(false);
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
