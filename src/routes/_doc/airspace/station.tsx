import { BatchCreateModal } from "@/components/atc-position/batch-create-modal";
import { BatchDeleteModal } from "@/components/atc-position/batch-delete-modal";
import { POSITION_CATEGORIES, PositionModal, type PositionAction } from "@/components/atc-position/position-modal";
import { RichTable, RichTableFeatures } from "@/components/table";
import { components } from "@/lib/api";
import { $api, usePermission } from "@/lib/client";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Button, Checkbox } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

type AtcPosition = components["schemas"]["AtcPositionDto"];
type AtcPositionCategory = components["schemas"]["AtcPositionCategory"];

const columns: ColumnDef<RichTableFeatures, AtcPosition>[] = [
  {
    accessorKey: "callsign",
    header: () => <Trans>ATC Position</Trans>,
    cell: ({ getValue, row }) => (
      <span className="flex flex-row gap-1">
        <code className="whitespace-nowrap">{getValue<string>()}</code>
        {row.original.is_tier_2 && (
          <Badge color="green" variant="outline">
            <Trans>Tier 2</Trans>
          </Badge>
        )}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: () => <Trans>Category</Trans>,
    cell: ({ getValue }) => <CategoryLabel category={getValue<AtcPositionCategory>()} />,
    meta: { filterValues: POSITION_CATEGORIES },
  },
  {
    accessorKey: "callsign_zh",
    header: () => <Trans>Chinese Callsign</Trans>,
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "callsign_en",
    header: () => <Trans>English Callsign</Trans>,
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    id: "frequency",
    accessorFn: (position) => (position.frequency_khz / 1000).toFixed(3),
    header: () => <Trans>Frequency</Trans>,
    cell: ({ getValue }) => <code>{getValue<string>()}</code>,
  },
  {
    accessorKey: "cpdlc_code",
    header: () => "CPDLC (S0780+)",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "remarks",
    header: () => <Trans>Remarks</Trans>,
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
];

export const Route = createFileRoute("/_doc/airspace/station")({
  component: StationPage,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`ATC Positions and Frequencies`) }],
  }),
});

function CategoryLabel({ category }: { category: AtcPositionCategory }) {
  const { i18n } = useLingui();
  return i18n._(POSITION_CATEGORIES.find((item) => item.value === category)!.label);
}

export function StationPage() {
  const { t } = useLingui();
  const canManage = usePermission("tech-afv-facility-engineer");
  const [action, setAction] = useState<PositionAction | null>(null);
  const [batchCreating, setBatchCreating] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const toggleSelection = (callsigns: string[], checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const callsign of callsigns) {
        if (checked) next.add(callsign);
        else next.delete(callsign);
      }
      return next;
    });
  };

  const managementColumns: ColumnDef<RichTableFeatures, AtcPosition>[] = canManage
    ? [
        {
          id: "selection",
          enableSorting: false,
          enableColumnFilter: false,
          header: ({ table }) => {
            const callsigns = table.getRowModel().rows.map((row) => row.original.callsign);
            const count = callsigns.filter((callsign) => selected.has(callsign)).length;
            return (
              <Checkbox
                aria-label={t`Select all positions on this page`}
                checked={callsigns.length > 0 && count === callsigns.length}
                indeterminate={count > 0 && count < callsigns.length}
                disabled={callsigns.length === 0}
                onChange={(event) => toggleSelection(callsigns, event.currentTarget.checked)}
              />
            );
          },
          cell: ({ row }) => {
            const callsign = row.original.callsign;
            return (
              <Checkbox
                aria-label={t`Select ${callsign}`}
                checked={selected.has(callsign)}
                onChange={(event) => toggleSelection([callsign], event.currentTarget.checked)}
              />
            );
          },
        },
        {
          id: "actions",
          header: () => <Trans>Actions</Trans>,
          enableSorting: false,
          enableColumnFilter: false,
          cell: ({ row }) => (
            <div className="flex gap-1">
              <Button
                variant="subtle"
                size="compact-sm"
                onClick={() => setAction({ kind: "edit", position: row.original })}
              >
                <Trans>Edit</Trans>
              </Button>
              <Button
                variant="subtle"
                color="red"
                size="compact-sm"
                onClick={() => setAction({ kind: "delete", position: row.original })}
              >
                <Trans>Delete</Trans>
              </Button>
            </div>
          ),
        },
      ]
    : [];
  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/positions");
  const selectedCallsigns = (data ?? [])
    .filter((position) => selected.has(position.callsign))
    .map((position) => position.callsign);
  const selectedCount = selectedCallsigns.length;

  return (
    <main className="container mx-auto flex flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>ATC Positions and Frequencies</Trans>
      </h1>

      <Alert color="blue">
        <Trans>
          CPDLC availability is decided by the controller. It is used at or above 7,800 meters; refer to the
          controller&apos;s ATC information.
        </Trans>
      </Alert>

      {error && (
        <Alert color="red" title={<Trans>Failed to load ATC positions</Trans>}>
          {error.detail}
        </Alert>
      )}

      {canManage && (
        <div className="flex gap-2">
          <Button onClick={() => setAction({ kind: "create" })}>
            <Trans>Create ATC Position</Trans>
          </Button>
          <Button variant="default" onClick={() => setBatchCreating(true)}>
            <Trans>Batch Create ATC Positions</Trans>
          </Button>
          <Button
            color="red"
            disabled={selectedCount === 0 || isLoading || !!error}
            onClick={() => setDeleting(selectedCallsigns)}
          >
            <Trans>Delete selected ({selectedCount})</Trans>
          </Button>
        </div>
      )}
      {canManage && action && <PositionModal action={action} onClose={() => setAction(null)} />}
      {canManage && batchCreating && <BatchCreateModal onClose={() => setBatchCreating(false)} />}
      {canManage && deleting && (
        <BatchDeleteModal
          callsigns={deleting}
          onDeleted={(callsign) => toggleSelection([callsign], false)}
          onClose={() => setDeleting(null)}
        />
      )}

      <RichTable
        data={data}
        columns={canManage ? [managementColumns[0], ...columns, ...managementColumns.slice(1)] : columns}
        isLoading={isLoading}
        initialState={{ pagination: { pageIndex: 0, pageSize: 50 } }}
        hideGlobalSearch
      />
    </main>
  );
}
