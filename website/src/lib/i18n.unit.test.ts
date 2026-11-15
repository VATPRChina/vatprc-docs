import { getLocalPathname } from "./i18n";
import { expect, test } from "vitest";

test("getLocalPathname handles path w/ local prefix", () => {
  expect(getLocalPathname("en", "/en/division/staff")).toBe("/en/division/staff");
  expect(getLocalPathname("en", "/zh-cn/division/staff")).toBe("/en/division/staff");

  expect(getLocalPathname("zh-cn", "/en/division/staff")).toBe("/zh-cn/division/staff");
  expect(getLocalPathname("zh-cn", "/zh-cn/division/staff")).toBe("/zh-cn/division/staff");
});

test("getLocalPathname handles path w/o local prefix", () => {
  expect(getLocalPathname("en", "/division/staff")).toBe("/en/division/staff");
  expect(getLocalPathname("zh-cn", "/division/staff")).toBe("/zh-cn/division/staff");
});
