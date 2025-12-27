import NoEventImage from "@/assets/no-event-image.svg";
import { BackButton } from "@/components/back-button";
import { DateTime } from "@/components/event/datetime";
import { CreateEvent } from "@/components/event/event-create";
import { EventDetail } from "@/components/event/event-detail";
import { ImportSlot } from "@/components/event/slot-import";
import { RichTable } from "@/components/table";
import type { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert, Button } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { isFuture, isPast } from "date-fns";
import { TbLockAccess } from "react-icons/tb";

export const Route = createFileRoute("/events/$id")({
  component: RouteComponent,
});

const EVENT_BOOKING_LIMIT = 1;

const columnHelper = createColumnHelper<components["schemas"]["EventSlotDto"]>();

const columns = [
  columnHelper.accessor("airspace.name", {
    header: () => <Trans>Route</Trans>,
  }),
  columnHelper.accessor((row) => [row.enter_at, row.leave_at] as const, {
    id: "time",
    header: () => <Trans>Time</Trans>,
    cell: ({ getValue }) => {
      const [enterAt, leaveAt] = getValue();
      return (
        <div className="flex gap-4">
          <span>
            <span className="text-muted-foreground">CTOT/</span>
            <DateTime noDistance noDate>
              {enterAt}
            </DateTime>
          </span>
          {leaveAt && (
            <span>
              <span className="text-muted-foreground">ELDT/</span>
              <DateTime noDistance noDate>
                {leaveAt}
              </DateTime>
            </span>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor((row) => [row.callsign, row.aircraft_type_icao] as const, {
    id: "callsign_aircraft",
    header: () => <Trans>Callsign & Aircraft</Trans>,
    cell: ({ getValue }) => {
      const [callsign, aircraft] = getValue();
      if (!callsign && !aircraft) {
        return <Trans>Not designated</Trans>;
      }
      return (
        <>
          {callsign}
          {aircraft && <span className="text-muted-foreground">({aircraft})</span>}
        </>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => null,
    enableSorting: false,
    cell: ({ row }) => {
      const slot = row.original;

      const { data: session } = $api.useQuery("get", "/api/session", {}, { retry: false });
      const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: slot.event_id } } });

      const { data: slots, refetch } = $api.useQuery("get", "/api/events/{eid}/slots", {
        params: { path: { eid: slot.event_id } },
      });
      const onMutateSuccess = () => {
        refetch().catch(console.error);
      };

      const { mutate: book, isPending: isBookPending } = $api.useMutation(
        "put",
        "/api/events/{eid}/slots/{sid}/booking",
        {
          onSuccess: onMutateSuccess,
        },
      );
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
        <div role="cell" className="flex gap-2">
          {!isBookedByCurrentUser && !isBookedByOtherUser && (
            <Button
              variant="subtle"
              size="compact-sm"
              disabled={!isLoggedIn || !isInBookingPeriod || isBookPending || isOverBookingLimit}
              onClick={onBook}
              loading={isBookPending}
            >
              <Trans>Book</Trans>
            </Button>
          )}
          {isBookedByOtherUser && (
            <Button variant="subtle" size="compact-sm" disabled>
              <Trans>Already Booked</Trans>
            </Button>
          )}
          {isBookedByCurrentUser && (
            <Button variant="subtle" size="compact-sm" onClick={onRelease} loading={isReleasePending}>
              <Trans>Release</Trans>
            </Button>
          )}
        </div>
      );
    },
  }),
];

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: session } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: id } } });
  const { data: slots, isLoading } = $api.useQuery("get", "/api/events/{eid}/slots", { params: { path: { eid: id } } });

  const isInBookingPeriod = event && isPast(event.start_booking_at) && isFuture(event.end_booking_at);

  console.log("inside", columns);

  return (
    event && (
      <div key={event.id} className="flex flex-col gap-4">
        <BackButton />
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
              <CreateEvent eventId={event?.id} />
            </Link>
            <EventDetail eventId={event.id} />
          </div>
        </div>
        <h2 className="text-2xl">
          <Trans>Slots</Trans>
          <ImportSlot eventId={event.id} />
        </h2>
        {!session && <Alert icon={<TbLockAccess />} color="blue" title={<Trans>Please login to book a slot.</Trans>} />}
        {!isInBookingPeriod && (
          <Alert
            icon={<TbLockAccess />}
            color="blue"
            title={<Trans>The booking has not started yet or has ended.</Trans>}
          />
        )}
        <RichTable data={slots} columns={columns} isLoading={isLoading} />
      </div>
    )
  );
}
