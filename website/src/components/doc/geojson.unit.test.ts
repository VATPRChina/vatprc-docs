import { parseGeojson } from "./geojson";
import { describe, expect, test } from "vitest";

const point = { type: "Point", coordinates: [116.6, 40.1] };
const line = {
  type: "LineString",
  coordinates: [
    [115, 39],
    [117, 41],
  ],
};
const ring = [
  [115, 39],
  [117, 39],
  [117, 41],
  [115, 39],
];

describe("parseGeojson", () => {
  test.each([
    point,
    line,
    { type: "Polygon", coordinates: [ring] },
    {
      type: "MultiPoint",
      coordinates: [
        [116, 40],
        [117, 41],
      ],
    },
    { type: "MultiLineString", coordinates: [line.coordinates] },
    { type: "MultiPolygon", coordinates: [[ring]] },
    { type: "GeometryCollection", geometries: [point, line] },
  ])("normalizes $type geometry", (geometry) => {
    expect(parseGeojson(JSON.stringify(geometry))).toEqual({
      type: "FeatureCollection",
      features: [{ type: "Feature", properties: {}, geometry }],
    });
  });

  test("preserves feature properties and null geometries", () => {
    const features = [
      { type: "Feature", properties: { name: "Airport" }, geometry: point },
      { type: "Feature", properties: null, geometry: null },
    ];
    const collection = { type: "FeatureCollection", features };
    expect(parseGeojson(JSON.stringify(features[0]))?.features).toEqual([features[0]]);
    expect(parseGeojson(JSON.stringify(collection))).toEqual(collection);
    expect(parseGeojson('{"type":"FeatureCollection","features":[]}')?.features).toEqual([]);
  });

  test.each([
    "not JSON",
    "null",
    "[]",
    "{}",
    '{"type":"Point","coordinates":[0]}',
    '{"type":"Point","coordinates":[0,"1"]}',
    '{"type":"Point","coordinates":[0,1e999]}',
    '{"type":"LineString","coordinates":[[0,0]]}',
    '{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,1]]]}',
    '{"type":"FeatureCollection","features":[{}]}',
    '{"type":"GeometryCollection","geometries":[{}]}',
  ])("rejects invalid GeoJSON: %s", (source) => {
    expect(parseGeojson(source)).toBeUndefined();
  });
});
