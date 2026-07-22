import { compareControllers, compareRatings, isMilitaryController } from "./controller-list";
import { describe, expect, it } from "vitest";

describe("compareRatings", () => {
  it("orders higher ratings first", () => {
    expect(compareRatings("S2", "OBS")).toBeLessThan(0);
    expect(compareRatings("OBS", "I3")).toBeGreaterThan(0);
    expect(compareRatings("S2", "S2")).toBe(0);
  });
});

describe("isMilitaryController", () => {
  it("recognizes a known military CID", () => {
    expect(isMilitaryController("1897662")).toBe(true);
  });

  it("rejects an unknown CID", () => {
    expect(isMilitaryController("1000000")).toBe(false);
  });
});

const controller = (overrides: { rating?: string; isVisiting?: boolean; isAbsent?: boolean; cid?: string }) =>
  ({
    is_absent: overrides.isAbsent ?? false,
    is_visiting: overrides.isVisiting ?? false,
    permissions: [],
    rating: overrides.rating ?? "S2",
    user: { id: "u", cid: overrides.cid ?? "1000001", full_name: "A" },
    user_id: "u",
  }) as unknown as Parameters<typeof compareControllers>[0];

describe("compareControllers", () => {
  it("sorts higher rating first", () => {
    expect(compareControllers(controller({ rating: "S2" }), controller({ rating: "S1" }))).toBeLessThan(0);
  });

  it("sorts visiting controllers after local ones at the same rating", () => {
    expect(compareControllers(controller({ isVisiting: true }), controller({ isVisiting: false }))).toBeGreaterThan(0);
  });

  it("sorts absent controllers last", () => {
    expect(compareControllers(controller({ isAbsent: true }), controller({ isAbsent: false }))).toBeGreaterThan(0);
  });

  it("falls back to CID when otherwise equal", () => {
    expect(compareControllers(controller({ cid: "1000001" }), controller({ cid: "1000002" }))).toBeLessThan(0);
  });
});
