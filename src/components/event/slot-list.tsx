import { RichTable } from "../table";
import { ConfirmButton } from "../ui/confirm-button";
import { DateTime } from "./datetime";
import { ImportSlot } from "./slot-import";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert, Button } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { isPast, isFuture } from "date-fns";
import { FC } from "react";
import { TbLockAccess } from "react-icons/tb";

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
            <ConfirmButton
              variant="subtle"
              size="compact-sm"
              disabled={!isLoggedIn || !isInBookingPeriod || isBookPending || isOverBookingLimit}
              onClick={onBook}
              loading={isBookPending}
              actionDescription={<Trans>Are you sure to book the slot?</Trans>}
            >
              <Trans>Book</Trans>
            </ConfirmButton>
          )}
          {isBookedByOtherUser && (
            <Button variant="subtle" size="compact-sm" disabled>
              <Trans>Already Booked</Trans>
            </Button>
          )}
          {isBookedByCurrentUser && (
            <ConfirmButton
              variant="subtle"
              size="compact-sm"
              onClick={onRelease}
              loading={isReleasePending}
              actionDescription={<Trans>Are you sure to release the slot?</Trans>}
            >
              <Trans>Release</Trans>
            </ConfirmButton>
          )}
        </div>
      );
    },
  }),
];

export const SlotList: FC<{ eventId: string }> = ({ eventId }) => {
  const { data: session } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: eventId } } });
  const { data: slots, isLoading } = $api.useQuery("get", "/api/events/{eid}/slots", {
    params: { path: { eid: eventId } },
  });
  const isInBookingPeriod = event && isPast(event.start_booking_at) && isFuture(event.end_booking_at);

  return (
    <>
      <h2 className="text-2xl">
        <Trans>Slots</Trans>
        <ImportSlot eventId={eventId} />
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
    </>
  );
};
