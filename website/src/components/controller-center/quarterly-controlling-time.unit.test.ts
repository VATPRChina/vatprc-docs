import { formatControllingHours } from "./quarterly-controlling-time";
import { describe, expect, it } from "vitest";

describe("formatControllingHours", () => {
  it("formats seconds as hours with one decimal place", () => {
    expect(formatControllingHours(0, "en")).toBe("0.0");
    expect(formatControllingHours(4_500, "en")).toBe("1.3");
  });
});
