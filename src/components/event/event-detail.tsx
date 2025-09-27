import { DateTime } from "./datetime";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { TbArrowRight } from "react-icons/tb";

export const EventDetail = ({ eventId }: { eventId: string }) => {
  const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: eventId } } });

  return (
    <div>
      <div className="flex flex-row flex-wrap items-baseline gap-2">
        <span>
          <Trans>Time:</Trans>
        </span>
        <DateTime>{event?.start_at}</DateTime>
        <TbArrowRight size={12} />
        <DateTime>{event?.end_at}</DateTime>
      </div>
      <div className="flex flex-row flex-wrap items-baseline gap-2">
        <span>
          <Trans>Booking:</Trans>
        </span>
        <DateTime>{event?.start_booking_at}</DateTime>
        <TbArrowRight size={12} />
        <DateTime>{event?.end_booking_at}</DateTime>
      </div>
      <div>{event?.description}</div>
    </div>
  );
};
