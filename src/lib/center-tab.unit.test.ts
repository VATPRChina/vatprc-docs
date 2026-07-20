import { resolveCenterTab } from "./center-tab";
import { describe, expect, it } from "vitest";

describe("resolveCenterTab", () => {
  it("returns mine for the center index", () => {
    expect(resolveCenterTab("/controllers")).toBe("mine");
    expect(resolveCenterTab("/zh-cn/controllers")).toBe("mine");
  });

  it("returns trainings for training routes", () => {
    expect(resolveCenterTab("/controllers/trainings")).toBe("trainings");
    expect(resolveCenterTab("/en/controllers/trainings/abc123")).toBe("trainings");
  });

  it("returns applications for application routes", () => {
    expect(resolveCenterTab("/controllers/applications")).toBe("applications");
    expect(resolveCenterTab("/zh-cn/controllers/applications/new")).toBe("applications");
  });

  it("falls back to mine for unknown sub-paths", () => {
    expect(resolveCenterTab("/controllers/unknown")).toBe("mine");
  });
});
