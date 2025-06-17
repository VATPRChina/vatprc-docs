import { getLocalPathname } from "./i18n";
import { expect, test } from "vitest";

test("getLocalPathname handles path w/ local prefix", () => {
  expect(getLocalPathname("/en/division/staff", "en")).toBe("/en/division/staff");
  expect(getLocalPathname("/zh-cn/division/staff", "en")).toBe("/en/division/staff");

  expect(getLocalPathname("/en/division/staff", "zh-cn")).toBe("/zh-cn/division/staff");
  expect(getLocalPathname("/zh-cn/division/staff", "zh-cn")).toBe("/zh-cn/division/staff");
});

test("getLocalPathname handles path w/o local prefix", () => {
  expect(getLocalPathname("/division/staff", "en")).toBe("/en/division/staff");
  expect(getLocalPathname("/division/staff", "zh-cn")).toBe("/zh-cn/division/staff");
});
