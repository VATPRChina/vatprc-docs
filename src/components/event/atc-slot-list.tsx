import { POSITION_KINDS_MAP, POSITION_STATE_MAP } from "../atc-permission-modal";
import { RequireRole } from "../require-role";
import { RichTable } from "../table";
import { CreateAtcSlot } from "./atc-slot-create";
import { DateTime } from "./datetime";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { renderLocalizedWithMap } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { createColumnHelper } from "@tanstack/react-table";
import { isSameMinute } from "date-fns";
import { FC } from "react";

const columnHelper = createColumnHelper<components["schemas"]["EventAtcPositionDto"]>();

const columns = [
  columnHelper.accessor("callsign", {
    header: () => <Trans>Route</Trans>,
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
  columnHelper.accessor("position_kind_id", {
    header: () => <Trans>Position</Trans>,
    cell: ({ getValue }) => renderLocalizedWithMap(POSITION_KINDS_MAP, getValue()),
  }),
  columnHelper.accessor("minimum_controller_state", {
    header: () => <Trans>Minimum State</Trans>,
    cell: ({ getValue }) => renderLocalizedWithMap(POSITION_STATE_MAP, getValue()),
  }),
  columnHelper.accessor("remarks", {
    header: () => <Trans>Remark</Trans>,
  }),
  columnHelper.display({
    id: "actions",
    header: () => null,
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <RequireRole role={["event-coordinator", "operation-director-assistant"]}>
          <CreateAtcSlot eventId={row.original.event.id} positionId={row.original.id} />
        </RequireRole>
      );
    },
  }),
];

export const AtcSlotList: FC<{ eventId: string }> = ({ eventId }) => {
  const { data: slots, isLoading } = $api.useQuery("get", "/api/events/{eventId}/controllers", {
    params: { path: { eventId } },
  });

  return (
    <>
      <h2 className="text-2xl">
        <Trans>Controllers</Trans>
      </h2>
      <RequireRole role={["event-coordinator", "operation-director-assistant"]}>
        <div className="flex flex-row gap-2">
          <CreateAtcSlot eventId={eventId} />
        </div>
      </RequireRole>
      <RichTable data={slots} columns={columns} isLoading={isLoading} />
    </>
  );
};
