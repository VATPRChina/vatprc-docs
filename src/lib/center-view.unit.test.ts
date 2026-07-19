import { resolveCenterView } from "./center-view";
import { describe, expect, it } from "vitest";

describe("resolveCenterView", () => {
  it("returns management for authorized users", () => {
    expect(resolveCenterView("management", true)).toBe("management");
  });

  it("falls back to mine without permission", () => {
    expect(resolveCenterView("management", false)).toBe("mine");
  });

  it("falls back to mine for missing or unknown values", () => {
    expect(resolveCenterView(undefined, true)).toBe("mine");
    expect(resolveCenterView("bogus", true)).toBe("mine");
  });
});
