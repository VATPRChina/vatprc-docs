import { parseRadarXml } from "./import";
import { expect, test } from "vitest";

const xml =
  '<Radars><Radar Name="Beijing" Type="SSR_ModeC" Elevation="120" MaxRange="200"><Lat>40</Lat><Long>116</Long></Radar></Radars>';
test("imports vatSys radar attributes and coordinates", () => {
  expect(parseRadarXml(xml)).toEqual([
    { name: "Beijing", type: "SSR", elevation: 120, maxRange: 200, lat: 40, lon: 116 },
  ]);
});
test("rejects malformed XML, missing coordinates, unsupported types and non-numeric ranges", () => {
  for (const text of [
    "<Radar>",
    "<Radars/>",
    xml.replace("<Lat>40</Lat>", ""),
    xml.replace("SSR_ModeC", "NONE"),
    xml.replace('MaxRange="200"', 'MaxRange="NaN"'),
  ])
    expect(() => parseRadarXml(text)).toThrow();
});
