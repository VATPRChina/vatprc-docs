import { buildRouteMap, type RouteFix, type RouteLeg } from "./flight-route-map";
import { expect, test } from "vitest";

const fix = (identifier: string, longitude: number | null, latitude: number | null = 0): RouteFix => ({
  identifier,
  longitude,
  latitude,
  is_unknown: longitude === null || latitude === null,
});
const leg = (from: RouteFix, to: RouteFix): RouteLeg => ({
  from,
  to,
  leg_identifier: "A1",
  is_unknown: false,
  is_sid: false,
  is_star: false,
});

test("keeps a date-line crossing local and preserves real zero coordinates", () => {
  const route = buildRouteMap([leg(fix("A", 179), fix("B", -179))]);
  expect(route.bounds).toEqual([179, 0, 181, 0]);
  expect(route.segments.features[0].geometry.coordinates).toEqual([
    [179, 0],
    [181, 0],
  ]);
  expect(buildRouteMap([leg(fix("ORIGIN", 0), fix("B", 1))]).points.features).toHaveLength(2);
});

test("does not connect across an unknown fix or place it at the origin", () => {
  const missing = fix("MISSING", null, null);
  const route = buildRouteMap([leg(fix("A", 100, 30), missing), leg(missing, fix("B", 110, 40))]);
  expect(route.segments.features).toEqual([]);
  expect(route.points.features.map((point) => point.properties.identifier)).toEqual(["A", "B"]);
  expect(route.unresolved).toEqual(["MISSING"]);
  expect(route.bounds).toEqual([100, 30, 110, 40]);
});

test("handles empty output and rejects nonfinite or invalid coordinates", () => {
  expect(buildRouteMap([]).bounds).toBeUndefined();
  const route = buildRouteMap([leg(fix("INVALID", 181), fix("NAN", NaN))]);
  expect(route.bounds).toBeUndefined();
  expect(route.unresolved).toEqual(["INVALID", "NAN"]);
});

test("marks mapped unknown connections for red styling without marking their fixes", () => {
  const route = buildRouteMap([{ ...leg(fix("A", 1), fix("B", 2)), is_unknown: true }]);
  expect(route.segments.features[0].properties.is_unknown).toBe(true);
  expect(route.unresolved).toEqual([]);
});
