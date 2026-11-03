import { airspaceAtPosition, airspaceEntries, airspaceHeight } from "./airspace";
import { parseRegion } from "./data";
import { calculateCoverage } from "./model";
import { Airspace, Coordinate, RadarRegion } from "./types";
import { expect, test } from "vitest";

const points: Coordinate[] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 0],
  [0, 0],
];
const sector = (name: string, lowerLimit: number, upperLimit: number | null): Airspace => ({
  name,
  lowerLimit,
  upperLimit,
  points,
});
const region: RadarRegion = {
  code: "TEST",
  name: "Test",
  boundary: points,
  radars: [
    { name: "A", type: "SSR", elevation: 0, maxRange: 2, lat: 0.5, lon: 0.5 },
    { name: "B", type: "SSR", elevation: 0, maxRange: 2, lat: 0.5, lon: 0.55 },
  ],
  airspace: {
    acc: [sector("CTR_LOW", 25600, 30100), sector("CTR_HIGH", 30100, null)],
    tma: [sector("APP", 0, 25600), sector("APP", 10000, 20000)],
    twr: [sector("TWR", 0, 2000)],
  },
};
test("reads actual ACC altitude fields without changing their values; accepts legacy boundary-only data", () => {
  const parsed = parseRegion("TEST", region, region.radars);
  expect(parsed.airspace?.acc?.[0]).toMatchObject({ lowerLimit: 25600, upperLimit: 30100 });
  expect(airspaceHeight(parsed.airspace!.acc![0])).toBe("7800 m – 9200 m");
  expect(airspaceHeight(sector("TWR", 0, null))).toBe("GND – UNL");
  expect(
    parseRegion("TEST", { ...region, airspace: { tma: [{ name: "Old", points }], twr: [] } }, region.radars).airspace
      ?.tma[0].lowerLimit,
  ).toBeUndefined();
  expect(() =>
    parseRegion("TEST", { ...region, airspace: { acc: [sector("Bad", 30000, 20000)] } }, region.radars),
  ).toThrow();
});
test("builds descending altitude bands with overlapping sectors and keeps duplicate names independently selectable", () => {
  const entries = airspaceEntries(region);
  expect(new Set(entries.map((entry) => entry.key)).size).toBe(entries.length);
  const { bands, unknown } = airspaceAtPosition(entries, [0.5, 0.5]);
  expect(unknown).toEqual([]);
  expect(bands.map(({ min, max, entries }) => [min, max, entries.map((entry) => entry.name)])).toEqual([
    [30100, Infinity, ["CTR_HIGH"]],
    [25600, 30100, ["CTR_LOW"]],
    [20000, 25600, ["APP"]],
    [10000, 20000, ["APP", "APP"]],
    [2000, 10000, ["APP"]],
    [0, 2000, ["APP", "TWR"]],
  ]);
});
test("includes shared polygon edges, shows gaps and never invents missing altitudes", () => {
  const entries = airspaceEntries({
    ...region,
    airspace: { acc: [sector("CTR", 10000, 20000)], tma: [{ name: "Unknown", points }], twr: [] },
  });
  const result = airspaceAtPosition(entries, [0, 0.5]);
  expect(result.unknown.map((entry) => entry.name)).toEqual(["Unknown"]);
  expect(result.bands.map(({ min, max, entries }) => [min, max, entries.length])).toEqual([
    [20000, Infinity, 0],
    [10000, 20000, 1],
    [0, 10000, 0],
  ]);
  expect(airspaceAtPosition(entries, [2, 2]).bands).toEqual([{ min: 0, max: Infinity, entries: [] }]);
});
test("selecting one radar removes coverage supplied only by another radar of the same type; clearing restores it", () => {
  const terrain = { step: 1, elevation: () => 0 };
  const request = { region, altitude: 10000, enabled: ["SSR" as const] };
  const all = calculateCoverage(request, terrain);
  const first = calculateCoverage({ ...request, selectedRadar: 0 }, terrain);
  const second = calculateCoverage({ ...request, selectedRadar: 1 }, terrain);
  const cleared = calculateCoverage({ ...request, selectedRadar: null }, terrain);
  expect(first.cells.features.length).toBeGreaterThan(0);
  expect(second.cells.features.length).toBeGreaterThan(0);
  expect(first.cells.features.length).toBeLessThan(all.cells.features.length);
  expect(first.cells).not.toEqual(second.cells);
  expect(cleared.cells).toEqual(all.cells);
  expect(first.stationHeights).toHaveLength(2);
});
