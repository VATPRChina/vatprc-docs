import { getStatusBadges } from "./identity-chip";
import { expect, test } from "vitest";

test("returns empty for a regular active controller", () => {
  expect(getStatusBadges({ is_visiting: false, is_absent: false })).toEqual([]);
});

test("returns visiting badge only when visiting", () => {
  expect(getStatusBadges({ is_visiting: true, is_absent: false })).toEqual(["visiting"]);
});

test("returns absent badge only when absent", () => {
  expect(getStatusBadges({ is_visiting: false, is_absent: true })).toEqual(["absent"]);
});

test("returns both badges when visiting and absent", () => {
  expect(getStatusBadges({ is_visiting: true, is_absent: true })).toEqual(["visiting", "absent"]);
});

test("returns empty when status is undefined", () => {
  expect(getStatusBadges(undefined)).toEqual([]);
});
