import { getDefaultEventTab } from "./event";
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
