import { getActiveGroup } from "./nav";
import { describe, expect, it } from "vitest";

const groups = [
  { items: [{ href: "/division/introduction" }, { href: "https://community.vatprc.net", external: true }] },
  { items: [{ href: "/pilot/start-to-fly" }, { href: "/flights" }] },
  { items: [{ href: "/controllers" }, { href: "/controller/sector" }] },
  { items: [{ href: "/events" }, { href: "https://community.vatprc.net", external: true }] },
  { items: [{ href: "/events" }, { href: "/users" }] },
];

describe("getActiveGroup", () => {
  it("matches by first path segment of item href", () => {
    expect(getActiveGroup("/pilot/introduction-to-fly", groups)).toBe(1);
    expect(getActiveGroup("/division/staff", groups)).toBe(0);
  });

  it("matches exact item href", () => {
    expect(getActiveGroup("/flights", groups)).toBe(1);
  });

  it("strips locale prefix before matching", () => {
    expect(getActiveGroup("/zh-cn/pilot/start-to-fly", groups)).toBe(1);
    expect(getActiveGroup("/en/controllers", groups)).toBe(2);
  });

  it("returns first declared group when multiple groups match", () => {
    expect(getActiveGroup("/events", groups)).toBe(3);
  });

  it("does not match external links", () => {
    const internalFormExternal = [{ items: [{ href: "/c/69-category", external: true }] }];
    expect(getActiveGroup("/c/69-category", internalFormExternal)).toBeUndefined();
    expect(getActiveGroup("/c/69-category", groups)).toBeUndefined();
  });

  it("returns undefined for root and unknown paths", () => {
    expect(getActiveGroup("/", groups)).toBeUndefined();
    expect(getActiveGroup("/zh-cn", groups)).toBeUndefined();
    expect(getActiveGroup("/nonexistent", groups)).toBeUndefined();
  });
});
