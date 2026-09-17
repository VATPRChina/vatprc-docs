import { coverageContours } from "./contours";
import { parseRadarData } from "./data";
import { calculateCoverage } from "./model";
import { CoverageResult } from "./types";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

function grid(hole = false): CoverageResult["cells"] {
  const features: CoverageResult["cells"]["features"] = [];
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 5; x++) {
      if (hole && x === 2 && y === 2) continue;
      features.push({
        type: "Feature",
        properties: { type: "SSR" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [x, y],
              [x + 1, y],
              [x + 1, y + 1],
              [x, y + 1],
              [x, y],
            ],
          ],
        },
      });
    }
  return { type: "FeatureCollection", features };
}

test("joins adjacent coverage cells into a rounded outline without changing source data", () => {
  const cells = grid();
  const original = structuredClone(cells);
  const contours = coverageContours(cells);
  expect(contours.features).toHaveLength(1);
  expect(contours.features[0].geometry.coordinates[0].length).toBeGreaterThan(5);
  expect(contours.features[0].properties.type).toBe("SSR");
  expect(cells).toEqual(original);
});

test("preserves uncovered holes and empty coverage", () => {
  expect(coverageContours(grid(true)).features[0].geometry.coordinates).toHaveLength(2);
  expect(coverageContours({ type: "FeatureCollection", features: [] }).features).toEqual([]);
});

test("smooths the supplied Kunming coverage into fewer features while retaining source labels", () => {
  const region = parseRadarData(readFileSync("assets/radar-data.js", "utf8")).find((r) => r.code === "ZPKM")!;
  const result = calculateCoverage({ region, altitude: 10000, enabled: ["SSR", "ADSB"] });
  const contours = coverageContours(result.cells);
  expect(contours.features.length).toBeGreaterThan(0);
  expect(contours.features.length).toBeLessThan(result.cells.features.length / 4);
  expect(new Set(contours.features.map((f) => f.properties.type))).toEqual(
    new Set(result.cells.features.map((f) => f.properties.type)),
  );
});
