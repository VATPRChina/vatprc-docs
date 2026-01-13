import { POSITION_KINDS_MAP, POSITION_STATE_MAP } from "../atc-permission-modal";
import { RequireRole } from "../require-role";
import { RichTable } from "../table";
import { ConfirmButton } from "../ui/confirm-button";
import { AssignAtcSlot } from "./atc-slot-assign";
import { CreateAtcSlot } from "./atc-slot-create";
import { AtcSlotDeleteButton } from "./atc-slot-delete";
import { DateTime } from "./datetime";
import { components } from "@/lib/api";
import { $api, useControllerPermission, useUser } from "@/lib/client";
import { localizeWithMap } from "@/lib/i18n";
import { wrapPromiseWithLog } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { isAfter, isSameMinute } from "date-fns";
import { FC } from "react";
import { TbExclamationCircle } from "react-icons/tb";

export const POSITION_KINDS_PRIORITY: string[] = ["DEL", "GND", "TWR", "T2", "APP", "CTR", "FSS", "FMP"];

export const POSITION_STATE_PRIORITY: components["schemas"]["UserControllerState"][] = [
  "student",
  "under-mentor",
  "solo",
  "certified",
  "mentor",
];

const columnHelper = createColumnHelper<components["schemas"]["EventAtcPositionDto"]>();

const columns = [
  columnHelper.accessor("callsign", {
    header: () => <Trans>Callsign</Trans>,
  }),
  columnHelper.accessor("start_at", {
    header: () => <Trans>Start at</Trans>,
    cell: ({ getValue, row }) =>
      isSameMinute(row.original.start_at, getValue()) ? (
        <Trans>Event start</Trans>
      ) : (
        <DateTime noDistance noDate>
          {getValue()}
        </DateTime>
      ),
  }),
  columnHelper.accessor("end_at", {
    header: () => <Trans>End at</Trans>,
    cell: ({ getValue, row }) =>
      isSameMinute(row.original.end_at, getValue()) ? (
        <Trans>Event end</Trans>
      ) : (
        <DateTime noDistance noDate>
          {getValue()}
        </DateTime>
      ),
  }),
  columnHelper.accessor((row) => [row.position_kind_id, row.minimum_controller_state, row.remarks] as const, {
    id: "position",
    header: () => <Trans>Position</Trans>,
    cell: ({ getValue }) => {
      const { i18n } = useLingui();
      const [position, state, remarks] = getValue();
      const hasPositionPermission = useControllerPermission(position, "student");
      const hasPermission = useControllerPermission(position, state);

      return (
        <div className="flex gap-2">
          <Badge color={hasPositionPermission ? "green" : "red"} variant="dot" size="lg">
            {localizeWithMap(POSITION_KINDS_MAP, position, i18n)}
          </Badge>
          <Badge color={hasPermission ? "green" : "red"} variant="dot" size="lg">
            {localizeWithMap(POSITION_STATE_MAP, state, i18n)}
          </Badge>
          <span>{remarks}</span>
        </div>
      );
    },
    sortingFn: (a, b) => {
      const kindA = POSITION_KINDS_PRIORITY.indexOf(a.original.position_kind_id);
      const kindB = POSITION_KINDS_PRIORITY.indexOf(b.original.position_kind_id);
      if (kindA !== kindB) {
        return kindA - kindB;
      }

      const stateA = POSITION_STATE_PRIORITY.indexOf(a.original.minimum_controller_state);
      const stateB = POSITION_STATE_PRIORITY.indexOf(b.original.minimum_controller_state);
      return stateA - stateB;
    },
  }),
  columnHelper.accessor("booking.user", {
    header: () => <Trans>CID</Trans>,
    cell: ({ getValue }) => {
      const user = getValue();
      if (!user) return <Trans>Not booked</Trans>;

      return (
        <div>
          <span>{user.full_name}</span>
          <span className="text-dimmed ml-0.5">{user.cid}</span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => null,
    enableSorting: false,
    cell: ({ row }) => {
      const queryClient = useQueryClient();

      const user = useUser();

      const { data } = $api.useQuery("get", "/api/events/{eventId}/controllers", {
        params: { path: { eventId: row.original.event.id } },
      });
      const slot = data?.find((s) => s.id === row.original.id);
      const isNotInBookingPeriod =
        !!slot?.event.start_atc_booking_at && !isAfter(Date.now(), slot.event.start_atc_booking_at);
      const onMutateSuccess = wrapPromiseWithLog(() =>
        queryClient.invalidateQueries(
          $api.queryOptions("get", "/api/events/{eventId}/controllers", {
            params: { path: { eventId: row.original.event.id } },
          }),
        ),
      );
      const { mutate: book, isPending: isBookPending } = $api.useMutation(
        "put",
        "/api/events/{eventId}/controllers/{positionId}/booking",
        {
          onSuccess: onMutateSuccess,
        },
      );
      const { mutate: release, isPending: isReleasePending } = $api.useMutation(
        "delete",
        "/api/events/{eventId}/controllers/{positionId}/booking",
        { onSuccess: onMutateSuccess },
      );

      const hasPermission = useControllerPermission(
        row.original.position_kind_id,
        row.original.minimum_controller_state,
      );

      const onBook = () => {
        book({ params: { path: { eventId: row.original.event.id, positionId: row.original.id } }, body: {} });
      };
      const onRelease = () => {
        release({ params: { path: { eventId: row.original.event.id, positionId: row.original.id } } });
      };

      return (
        <div className="flex flex-row items-center gap-2">
          <RequireRole role={["event-coordinator", "operation-director-assistant"]}>
            <CreateAtcSlot eventId={row.original.event.id} positionId={row.original.id} />
            <AtcSlotDeleteButton eventId={row.original.event.id} positionId={row.original.id} />
            <AssignAtcSlot eventId={row.original.event.id} positionId={row.original.id} />
          </RequireRole>
          <RequireRole role="controller">
            <ConfirmButton
              actionDescription={<Trans>Are you sure to book this ATC position?</Trans>}
              variant="subtle"
              size="compact-sm"
              onClick={onBook}
              loading={isBookPending}
              disabled={!!slot?.booking || !hasPermission || isNotInBookingPeriod}
            >
              <Trans>Book</Trans>
            </ConfirmButton>
            <ConfirmButton
              actionDescription={<Trans>Are you sure to release this ATC position?</Trans>}
              variant="subtle"
              size="compact-sm"
              onClick={onRelease}
              loading={isReleasePending}
              disabled={!slot?.booking || !hasPermission || slot.booking.user_id !== user?.id || isNotInBookingPeriod}
            >
              <Trans>Release</Trans>
            </ConfirmButton>
          </RequireRole>
        </div>
      );
    },
  }),
];

export const AtcSlotList: FC<{ eventId: string }> = ({ eventId }) => {
  const { t } = useLingui();

  const {
    data: slots,
    isLoading,
    error,
  } = $api.useQuery("get", "/api/events/{eventId}/controllers", {
    params: { path: { eventId } },
  });

  return (
    <>
      <h2 className="text-2xl">
        <Trans>Controllers</Trans>
      </h2>
      {error && (
        <Alert color="red" icon={<TbExclamationCircle />} title={t`Error`}>
          {error.message}
        </Alert>
      )}
      <RequireRole role={["event-coordinator", "operation-director-assistant"]}>
        <div className="flex flex-row gap-2">
          <CreateAtcSlot eventId={eventId} />
        </div>
      </RequireRole>
      <RichTable
        data={slots}
        columns={columns}
        isLoading={isLoading}
        initialState={{ sorting: [{ desc: false, id: "position" }], pagination: { pageSize: 20 } }}
      />
    </>
  );
};
