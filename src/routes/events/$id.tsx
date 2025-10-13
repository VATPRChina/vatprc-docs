import NoEventImage from "@/assets/no-event-image.svg";
import { DateTime } from "@/components/event/datetime";
import { EventDetail } from "@/components/event/event-detail";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/button-link";
import type { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isFuture, isPast } from "date-fns";
import type { FC } from "react";
import { TbArrowLeft, TbLoader2, TbLockAccess } from "react-icons/tb";

export const Route = createFileRoute("/events/$id")({
  component: RouteComponent,
});

const EVENT_BOOKING_LIMIT = 1;

const SlotRow: FC<{ slot: components["schemas"]["EventSlotDto"] }> = ({ slot }) => {
  const { data: session } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: slot.event_id } } });

  const { data: slots, refetch } = $api.useQuery("get", "/api/events/{eid}/slots", {
    params: { path: { eid: slot.event_id } },
  });
  const onMutateSuccess = () => {
    refetch().catch(console.error);
  };

  const { mutate: book, isPending: isBookPending } = $api.useMutation("put", "/api/events/{eid}/slots/{sid}/booking", {
    onSuccess: onMutateSuccess,
  });
  const { mutate: release, isPending: isReleasePending } = $api.useMutation(
    "delete",
    "/api/events/{eid}/slots/{sid}/booking",
    { onSuccess: onMutateSuccess },
  );

  const isLoggedIn = !!session?.user.id;
  const isBookedByCurrentUser = isLoggedIn && slot.booking?.user_id === session.user.id;
  const isBookedByOtherUser = slot.booking && slot.booking.user_id !== session?.user.id;
  const isInBookingPeriod = event && isPast(event.start_booking_at) && isFuture(event.end_booking_at);
  const isOverBookingLimit =
    (slots?.filter((slot) => slot.booking?.user_id === session?.user?.id).length ?? 0) >= EVENT_BOOKING_LIMIT;

  const onBook = () => {
    book({ params: { path: { eid: slot.event_id, sid: slot.id } } });
  };
  const onRelease = () => {
    release({ params: { path: { eid: slot.event_id, sid: slot.id } } });
  };

  return (
    <div role="row" className="contents">
      <div role="cell">{slot.airspace.name}</div>
      <div role="cell">
        <div className="flex gap-4">
          <span>
            <span className="text-muted-foreground">CTOT/</span>
            <DateTime noDistance noDate>
              {slot.enter_at}
            </DateTime>
          </span>
          {slot.leave_at && (
            <span>
              <span className="text-muted-foreground">ELDT/</span>
              <DateTime noDistance noDate>
                {slot.leave_at}
              </DateTime>
            </span>
          )}
        </div>
      </div>
      {!!slot.callsign || !!slot.aircraft_type_icao ? (
        <div role="cell">
          {slot.callsign}
          {slot.aircraft_type_icao && <span className="text-muted-foreground">({slot.aircraft_type_icao})</span>}
        </div>
      ) : (
        <div role="cell">
          <Trans>Not designated</Trans>
        </div>
      )}
      <div role="cell" className="flex gap-1">
        {!isBookedByCurrentUser && !isBookedByOtherUser && (
          <Button
            variant="outline"
            disabled={!isLoggedIn || !isInBookingPeriod || isBookPending || isOverBookingLimit}
            onClick={onBook}
          >
            {isBookPending && <TbLoader2 className="animate-spin" />}
            <Trans>Book</Trans>
          </Button>
        )}
        {isBookedByOtherUser && (
          <Button variant="outline" disabled>
            <Trans>Already Booked</Trans>
          </Button>
        )}
        {isBookedByCurrentUser && (
          <Button variant="outline" onClick={onRelease} disabled={isReleasePending}>
            {isReleasePending && <TbLoader2 className="animate-spin" />}
            <Trans>Release</Trans>
          </Button>
        )}
      </div>
    </div>
  );
};

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: session } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: id } } });
  const { data: slots } = $api.useQuery("get", "/api/events/{eid}/slots", { params: { path: { eid: id } } });

  const rows = slots?.map((slot) => <SlotRow key={slot.id} slot={slot} />);
  const isInBookingPeriod = event && isPast(event.start_booking_at) && isFuture(event.end_booking_at);

  return (
    event && (
      <div key={event.id} className="flex flex-col gap-4">
        <LinkButton variant="ghost" to=".." className="self-start">
          <TbArrowLeft />
          <Trans>Back</Trans>
        </LinkButton>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <img src={event.image_url ?? NoEventImage} className="" />
          <div className="flex flex-col gap-4">
            <Link
              to="/events/$id"
              params={{ id: event.id }}
              role="heading"
              aria-level={1}
              className="text-4xl font-bold"
            >
              {event.title}
            </Link>
            <EventDetail eventId={event.id} />
          </div>
        </div>
        <h2 className="text-2xl">
          <Trans>Slots</Trans>
        </h2>
        {!session && (
          <Alert>
            <TbLockAccess />
            <AlertTitle>
              <Trans>Please login to book a slot.</Trans>
            </AlertTitle>
          </Alert>
        )}
        {!isInBookingPeriod && (
          <Alert>
            <TbLockAccess />
            <AlertTitle>
              <Trans>The booking has not started yet or has ended.</Trans>
            </AlertTitle>
          </Alert>
        )}
        {(slots?.length ?? 0) > 0 && (
          <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-x-8 gap-y-1" role="table">
            <div className="contents font-bold" role="row">
              <div role="columnheader">
                <Trans>Area</Trans>
              </div>
              <div role="columnheader">
                <Trans>Time</Trans>
              </div>
              <div role="columnheader">
                <Trans>Callsign & Aircraft</Trans>
              </div>
              <div role="columnheader"></div>
            </div>
            <div className="contents" role="rowgroup">
              {rows}
            </div>
          </div>
        )}
      </div>
    )
  );
}
