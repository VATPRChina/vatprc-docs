import { DateTime } from "./datetime";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Anchor } from "@mantine/core";
import { FC } from "react";
import { TbArrowRight } from "react-icons/tb";

export const EventSummary: FC<
  Pick<
    components["schemas"]["EventDto"],
    "start_at" | "end_at" | "start_booking_at" | "end_booking_at" | "start_atc_booking_at"
  >
> = ({ start_at, end_at, start_booking_at, end_booking_at, start_atc_booking_at }) => {
  return (
    <>
      <div className="flex flex-row flex-wrap items-baseline gap-2">
        <span>
          <Trans>Time:</Trans>
        </span>
        <DateTime>{start_at}</DateTime>
        <TbArrowRight size={12} />
        <DateTime>{end_at}</DateTime>
      </div>
      {start_booking_at && end_booking_at ? (
        <div className="flex flex-row flex-wrap items-baseline gap-2">
          <span>
            <Trans>Booking:</Trans>
          </span>
          <DateTime>{start_booking_at}</DateTime>
          <TbArrowRight size={12} />
          <DateTime>{end_booking_at}</DateTime>
        </div>
      ) : (
        <div className="flex flex-row flex-wrap items-baseline gap-2">
          <span>
            <Trans>This event does not have pilot booking.</Trans>
          </span>
        </div>
      )}
      {start_atc_booking_at && (
        <div className="flex flex-row flex-wrap items-baseline gap-2">
          <span>
            <Trans>ATC Booking:</Trans>
          </span>
          <DateTime>{start_atc_booking_at}</DateTime>
          <TbArrowRight size={12} />
          <DateTime>{start_at}</DateTime>
        </div>
      )}
    </>
  );
};

export const EventDetail = ({ eventId }: { eventId: string }) => {
  const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: eventId } } });

  return (
    <div className="flex flex-col gap-2">
      {event && <EventSummary {...event} />}
      <div className="flex flex-row items-baseline gap-2">
        {event?.community_link && event.community_link.length > 0 && (
          <Anchor href={event.community_link} target="_blank" rel="noreferrer">
            <Trans>Forum</Trans>
          </Anchor>
        )}
        {event?.vatsim_link && event.vatsim_link.length > 0 && (
          <Anchor href={event.vatsim_link} target="_blank" rel="noreferrer">
            <Trans>VATSIM</Trans>
          </Anchor>
        )}
      </div>
      <div>{event?.description}</div>
    </div>
  );
};
