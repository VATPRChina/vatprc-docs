import { AtcPermissionModalButton } from "./atc-permission-modal";
import { RichTable } from "./table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { compareControllers, compareRatings, isMilitaryController } from "@/lib/controller-list";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Checkbox, Tooltip } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import React, { ChangeEvent, useState } from "react";

type AtcStatusDto = components["schemas"]["AtcStatusDto"];
type AtcPermissionDto = components["schemas"]["AtcPermissionDto"];

const POSITION_KINDS = ["DEL", "GND", "TWR", "T2", "APP", "CTR", "FMP"];

const RATING_FILTER_VALUES = [
  { value: "OBS", label: msg`OBS` },
  { value: "S1", label: msg`S1` },
  { value: "S2", label: msg`S2` },
  { value: "S3", label: msg`S3` },
  { value: "C1", label: msg`C1` },
  { value: "C3", label: msg`C3` },
  { value: "I1", label: msg`I1` },
  { value: "I3", label: msg`I3` },
];

const PermissionBadge: React.FC<{ permissions: AtcPermissionDto[]; kind: string }> = ({ permissions, kind }) => {
  const permission = permissions.find((p) => p.position_kind_id === kind);
  if (!permission) return null;

  const badge = (
    <span
      className={cn(
        "flex items-center justify-center px-2 py-1 font-mono text-sm",
        permission.state === "mentor" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        permission.state === "certified" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        permission.state === "under-mentor" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        permission.state === "solo" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        permission.state === "student" && "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
      )}
    >
      {permission.state === "student" && "✘"}
      {permission.state === "under-mentor" && "T"}
      {permission.state === "solo" && "S"}
      {(permission.state === "certified" || permission.state === "mentor") && "✓"}
    </span>
  );

  if (!permission.solo_expires_at) return badge;

  return (
    <Tooltip
      label={
        <>
          <Trans>until</Trans> {format(permission.solo_expires_at, "yyyy-MM-dd", { in: utc })}
        </>
      }
    >
      {badge}
    </Tooltip>
  );
};

const col = createColumnHelper<AtcStatusDto>();

const columns = [
  col.accessor((c) => `${c.user.full_name} ${c.user.cid}`.trim(), {
    id: "controller",
    header: () => <Trans>Controller</Trans>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.original.user.full_name}</span>
        <span className="text-dimmed text-sm">{row.original.user.cid}</span>
        <AtcPermissionModalButton userId={row.original.user_id} iconOnly />
      </div>
    ),
  }),
  col.accessor("rating", {
    header: () => <Trans>Rating</Trans>,
    sortingFn: (rowA, rowB) => compareRatings(rowA.original.rating, rowB.original.rating),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-mono">
        <span className="font-bold">{row.original.rating}</span>
        {row.original.is_visiting && <span className="font-light">(V)</span>}
        {row.original.is_absent && (
          <span className="font-bold text-red-700 dark:text-red-400">
            <Trans>Absent</Trans>
          </span>
        )}
      </div>
    ),
    meta: { filterValues: RATING_FILTER_VALUES },
  }),
  ...POSITION_KINDS.map((kind) =>
    col.display({
      id: `permission-${kind}`,
      header: () => <div className="text-center">{kind}</div>,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <PermissionBadge permissions={row.original.permissions} kind={kind} />
        </div>
      ),
    }),
  ),
  col.display({
    id: "military",
    header: () => <div className="text-center">MIL</div>,
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) =>
      isMilitaryController(row.original.user.cid) ? (
        <div className="flex justify-center">
          <span className="flex items-center justify-center bg-green-100 px-2 py-1 font-mono text-sm text-green-700 dark:bg-green-900 dark:text-green-300">
            ✓
          </span>
        </div>
      ) : null,
  }),
];

export const ControllerListTable: React.FC = () => {
  const [showAbsent, setShowAbsent] = useState(false);
  const { data, isLoading } = $api.useQuery("get", "/api/atc/controllers");

  const rows = (data ?? [])
    .filter((c) => showAbsent || !c.is_absent)
    .filter((c) => c.permissions.some((p) => p.state !== "student") || c.is_absent)
    .toSorted(compareControllers);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <Checkbox
        checked={showAbsent}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setShowAbsent(e.target.checked)}
        label={<Trans>Show Absence Controllers</Trans>}
      />
      <RichTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        initialState={{ pagination: { pageSize: Number.MAX_SAFE_INTEGER } }}
        hideGlobalSearch
        stickyHeader
      />
    </div>
  );
};
