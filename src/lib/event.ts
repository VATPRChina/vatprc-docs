import { components } from "./api";

type EventBookingPeriod = Pick<components["schemas"]["EventDto"], "end_booking_at" | "start_booking_at">;

export const getDefaultEventTab = ({ start_booking_at, end_booking_at }: EventBookingPeriod) =>
  start_booking_at && end_booking_at ? "slot" : "controller";
