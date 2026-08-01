import { formatFlightFix } from "./$callsign";
import { describe, expect, test } from "vitest";

describe("formatFlightFix", () => {
  test("uses the identifier for a named waypoint", () => {
    expect(formatFlightFix({ identifier: "  ABTUB  ", latitude: 31, longitude: 121 })).toBe("ABTUB");
  });

  test("formats a geographic coordinate point with hemispheres", () => {
    expect(formatFlightFix({ latitude: 31.5, longitude: 121.25 })).toBe("31.5000°N 121.2500°E");
    expect(formatFlightFix({ identifier: "", latitude: -12.5, longitude: -45.75 })).toBe("12.5000°S 45.7500°W");
  });

  test("supports coordinates on the equator and prime meridian", () => {
    expect(formatFlightFix({ latitude: 0, longitude: 0 })).toBe("0.0000°N 0.0000°E");
  });

  test("uses a placeholder when neither a valid identifier nor valid coordinates are available", () => {
    expect(formatFlightFix({ identifier: "" })).toBe("—");
    expect(formatFlightFix({ latitude: 91, longitude: 0 })).toBe("—");
    expect(formatFlightFix({ latitude: 0, longitude: Number.NaN })).toBe("—");
  });
});
