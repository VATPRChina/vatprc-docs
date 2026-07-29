import { sortTrainings } from "./training-browser";
import { expect, test } from "vitest";

const now = new Date("2026-07-18T00:00:00Z");
const t = (start_at: string) => ({ start_at });

test("puts upcoming trainings first, soonest first", () => {
  const result = sortTrainings([t("2026-08-01T12:00:00Z"), t("2026-07-20T12:00:00Z")], now);
  expect(result.map((x) => x.start_at)).toEqual(["2026-07-20T12:00:00Z", "2026-08-01T12:00:00Z"]);
});

test("puts past trainings after upcoming ones, latest first", () => {
  const result = sortTrainings([t("2026-06-01T12:00:00Z"), t("2026-07-20T12:00:00Z"), t("2026-07-01T12:00:00Z")], now);
  expect(result.map((x) => x.start_at)).toEqual([
    "2026-07-20T12:00:00Z",
    "2026-07-01T12:00:00Z",
    "2026-06-01T12:00:00Z",
  ]);
});

test("handles empty list", () => {
  expect(sortTrainings([], now)).toEqual([]);
});
