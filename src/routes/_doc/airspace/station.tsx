import { RichTable } from "@/components/table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Alert, Badge } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

type AtcPosition = components["schemas"]["AtcPositionDto"];
type AtcPositionCategory = components["schemas"]["AtcPositionCategory"];

const CATEGORY_LABELS: Record<AtcPositionCategory, MessageDescriptor> = {
  standard: msg`Standard`,
  "chengdu-low-area": msg`Chengdu Low Area`,
  military: msg`Military`,
  atis: msg`ATIS`,
};

const CATEGORY_FILTERS: { value: AtcPositionCategory; label: MessageDescriptor }[] = [
  { value: "standard", label: msg`Standard` },
  { value: "chengdu-low-area", label: msg`Chengdu Low Area` },
  { value: "military", label: msg`Military` },
  { value: "atis", label: msg`ATIS` },
];

const columns: ColumnDef<AtcPosition>[] = [
  {
    accessorKey: "callsign",
    header: () => <Trans>ATC Position</Trans>,
    cell: ({ getValue }) => <code className="whitespace-nowrap">{getValue<string>()}</code>,
  },
  {
    accessorKey: "category",
    header: () => <Trans>Category</Trans>,
    cell: ({ getValue }) => <CategoryLabel category={getValue<AtcPositionCategory>()} />,
    meta: { filterValues: CATEGORY_FILTERS },
  },
  {
    accessorKey: "is_tier_2",
    header: () => <Trans>Tier 2</Trans>,
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge color="green" variant="light">
          <Trans>Yes</Trans>
        </Badge>
      ) : null,
    enableGlobalFilter: false,
    enableColumnFilter: false,
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
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`ATC Positions and Frequencies`) }],
  }),
});

function CategoryLabel({ category }: { category: AtcPositionCategory }) {
  const { i18n } = useLingui();
  return i18n._(CATEGORY_LABELS[category]);
}

function RouteComponent() {
  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/positions");

  return (
    <main className="container mx-auto flex flex-col gap-4">
      <div>
        <h1 className="text-3xl">
          <Trans>ATC Positions and Frequencies</Trans>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          <Trans>Search by position, callsign, frequency, category, or CPDLC code.</Trans>
        </p>
      </div>

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

      <div className="overflow-x-auto">
        <RichTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          stickyHeader
          initialState={{ pagination: { pageIndex: 0, pageSize: 50 } }}
        />
      </div>
    </main>
  );
}
