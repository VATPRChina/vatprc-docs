import { feetToRoundedMeters, formatCruisingLevelInMeters, getCruisingLevelInMeters } from "./altitude";
import { expect, test } from "vitest";

test("feetToRoundedMeters rounds unmatched cruising levels to the nearest 100 meters", () => {
  expect(feetToRoundedMeters(30_000)).toBe(9_100);
});

test("getCruisingLevelInMeters uses the China RVSM table when matched", () => {
  expect(getCruisingLevelInMeters(29_100)).toEqual({ meters: 8_900, isChinaRvsm: true });
  expect(getCruisingLevelInMeters(41_100)).toEqual({ meters: 12_500, isChinaRvsm: true });
  expect(getCruisingLevelInMeters(43_000)).toEqual({ meters: 13_100, isChinaRvsm: true });
  expect(getCruisingLevelInMeters(44_900)).toEqual({ meters: 13_700, isChinaRvsm: true });
});

test("getCruisingLevelInMeters falls back to conversion when unmatched", () => {
  expect(getCruisingLevelInMeters(30_000)).toEqual({ meters: 9_100, isChinaRvsm: false });
});

test("formatCruisingLevelInMeters formats the metric counterpart", () => {
  expect(formatCruisingLevelInMeters(29_100)).toBe("8,900 m");
});
