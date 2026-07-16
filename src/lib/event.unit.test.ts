import { getDefaultEventTab, getEventTitle } from "./event";
import { expect, test } from "vitest";

test("defaults to controller bookings when pilot booking is not configured", () => {
  expect(getDefaultEventTab({ start_booking_at: null, end_booking_at: null })).toBe("controller");
});

test("defaults to pilot slots when pilot booking is configured", () => {
  expect(
    getDefaultEventTab({
      start_booking_at: "2026-07-01T00:00:00.000Z",
      end_booking_at: "2026-07-02T00:00:00.000Z",
    }),
  ).toBe("slot");
});

test("defaults to controller bookings when the pilot booking period is incomplete", () => {
  expect(getDefaultEventTab({ start_booking_at: "2026-07-01T00:00:00.000Z", end_booking_at: null })).toBe("controller");
});

test("returns english title when locale is en and title_en exists", () => {
  expect(getEventTitle({ title: "空中丝绸之路", title_en: "Silk Road in the Sky" }, "en")).toBe("Silk Road in the Sky");
});

test("falls back to chinese title when title_en is missing", () => {
  expect(getEventTitle({ title: "活动协助", title_en: null }, "en")).toBe("活动协助");
});

test("returns chinese title for zh locale", () => {
  expect(getEventTitle({ title: "空中丝绸之路", title_en: "Silk Road in the Sky" }, "zh-cn")).toBe("空中丝绸之路");
});
