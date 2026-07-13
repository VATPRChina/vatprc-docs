import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { useInterval } from "@mantine/hooks";
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
  const interval = useInterval(() => setNow(Date.now()), 60_000);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, [interval]);

  const { data: positions } = $api.useQuery("get", "/api/events/{event_id}/controllers", {
    params: { path: { event_id: eventId } },
  });

  if (!positions || !hasInsufficientAreaControllerBookings(eventStart, positions, now)) return null;

  return (
    <Alert color="yellow" icon={<TbExclamationCircle />} title={<Trans>Insufficient controller bookings</Trans>}>
      <Trans>Less than half of the configured area control positions have been booked for this event.</Trans>
    </Alert>
  );
};
