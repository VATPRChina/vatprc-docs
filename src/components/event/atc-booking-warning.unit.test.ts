import { hasInsufficientAreaControllerBookings } from "./atc-booking-warning";
import { expect, test } from "vitest";

const eventStart = "2026-07-14T12:00:00.000Z";
const insideWarningWindow = "2026-07-14T04:00:00.000Z";

const position = (kind: string, booked: boolean) => ({
  position_kind_id: kind,
  booking: booked
    ? {
        booked_at: "2026-07-13T00:00:00.000Z",
        user_id: "controller",
        user: {} as never,
      }
    : null,
});

test("warns within eight hours when fewer than half of area positions are booked", () => {
  expect(
    hasInsufficientAreaControllerBookings(
      eventStart,
      [position("CTR", true), position("CTR", false), position("CTR", false)],
      insideWarningWindow,
    ),
  ).toBe(true);
});

test("does not warn when exactly half of area positions are booked", () => {
  expect(
    hasInsufficientAreaControllerBookings(
      eventStart,
      [position("CTR", true), position("CTR", false)],
      insideWarningWindow,
    ),
  ).toBe(false);
});

test("does not warn when no area positions are configured", () => {
  expect(hasInsufficientAreaControllerBookings(eventStart, [position("TWR", false)], insideWarningWindow)).toBe(false);
});

test("does not warn before the eight-hour window or after the event starts", () => {
  const positions = [position("CTR", false)];

  expect(hasInsufficientAreaControllerBookings(eventStart, positions, "2026-07-14T03:59:59.999Z")).toBe(false);
  expect(hasInsufficientAreaControllerBookings(eventStart, positions, eventStart)).toBe(false);
});
