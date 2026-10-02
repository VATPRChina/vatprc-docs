import { POSITION_CATEGORIES, PositionModal, type PositionAction } from "@/components/atc-position/position-modal";
import { RichTable, RichTableFeatures } from "@/components/table";
import { components } from "@/lib/api";
import { $api, usePermission } from "@/lib/client";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Alert, Badge, Button } from "@mantine/core";
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
  const canManage = usePermission("tech-afv-facility-engineer");
  const [action, setAction] = useState<PositionAction | null>(null);
  const managementColumns: ColumnDef<RichTableFeatures, AtcPosition>[] = canManage
    ? [
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
        <div>
          <Button onClick={() => setAction({ kind: "create" })}>
            <Trans>Create ATC Position</Trans>
          </Button>
        </div>
      )}
      {canManage && action && <PositionModal action={action} onClose={() => setAction(null)} />}

      <RichTable
        data={data}
        columns={[...columns, ...managementColumns]}
        isLoading={isLoading}
        initialState={{ pagination: { pageIndex: 0, pageSize: 50 } }}
        hideGlobalSearch
      />
    </main>
  );
}
