import { selectMyPositions, selectUpcomingEvents } from "./my-event-bookings";
import { expect, test } from "vitest";

const now = new Date("2026-07-18T00:00:00Z");

test("keeps only events that have not ended, capped at limit", () => {
  const events = [
    { end_at: "2026-07-01T00:00:00Z" },
    { end_at: "2026-07-19T00:00:00Z" },
    { end_at: "2026-07-20T00:00:00Z" },
    { end_at: "2026-07-21T00:00:00Z" },
  ];
  expect(selectUpcomingEvents(events, now, 2)).toEqual([
    { end_at: "2026-07-19T00:00:00Z" },
    { end_at: "2026-07-20T00:00:00Z" },
  ]);
});

test("selects positions booked by the given user", () => {
  const positions = [{ booking: { user_id: "me" } }, { booking: { user_id: "other" } }, { booking: null }, {}];
  expect(selectMyPositions(positions, "me")).toEqual([{ booking: { user_id: "me" } }]);
});
