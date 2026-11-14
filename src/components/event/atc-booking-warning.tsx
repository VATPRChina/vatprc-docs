import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import { TbExclamationCircle } from "react-icons/tb";

const ATC_BOOKING_WARNING_WINDOW_MS = 8 * 60 * 60 * 1000;

type AtcPosition = Pick<components["schemas"]["EventAtcPositionDto"], "booking" | "position_kind_id">;

export const hasInsufficientAreaControllerBookings = (
  eventStart: string | Date,
  positions: AtcPosition[],
  now: string | Date | number = Date.now(),
) => {
  const timeUntilEvent = new Date(eventStart).getTime() - new Date(now).getTime();
  if (timeUntilEvent <= 0 || timeUntilEvent > ATC_BOOKING_WARNING_WINDOW_MS) return false;

  const areaPositions = positions.filter((position) => position.position_kind_id === "CTR");
  if (areaPositions.length === 0) return false;

  const bookedAreaPositions = areaPositions.filter((position) => position.booking != null).length;
  return bookedAreaPositions * 2 < areaPositions.length;
};

export const AtcBookingWarning = ({ eventId, eventStart }: { eventId: string; eventStart: string }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const { data: positions, error } = $api.useQuery("get", "/api/events/{event_id}/controllers", {
    params: { path: { event_id: eventId } },
  });

  if (error) {
    return (
      <Alert variant={"destructive"}>
        <AlertTitle>{error.title}</AlertTitle>
        <AlertDescription>{error.detail}</AlertDescription>
      </Alert>
    );
  }
  if (!positions || !hasInsufficientAreaControllerBookings(eventStart, positions, now)) return null;

  return (
    <Alert>
      {<TbExclamationCircle />}
      <AlertTitle>{<Trans>Insufficient controller bookings</Trans>}</AlertTitle>
      <AlertDescription>
        <Trans>Less than half of the configured area control positions have been booked for this event.</Trans>
      </AlertDescription>
    </Alert>
  );
};
