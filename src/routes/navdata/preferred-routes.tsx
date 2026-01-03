import { CreatePreferredRoute } from "@/components/preferred-route-create";
import { RichTable } from "@/components/table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<components["schemas"]["PreferredRouteDto"]>[] = [
  {
    accessorKey: "departure",
    header: () => <Trans>Departure</Trans>,
  },
  {
    accessorKey: "arrival",
    header: () => <Trans>Arrival</Trans>,
  },
  {
    accessorKey: "raw_route",
    header: () => <Trans>Route</Trans>,
  },
  {
    accessorKey: "remarks",
    header: () => <Trans>Remark</Trans>,
    cell: ({ row, getValue }) => {
      return (
        <div className="flex flex-row items-center gap-2">
          <span>{getValue<string>()}</span>
          <CreatePreferredRoute id={row.original.id} />
        </div>
      );
    },
  },
];

export const Route = createFileRoute("/navdata/preferred-routes")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = $api.useQuery("get", "/api/navdata/preferred-routes");

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div>
        <CreatePreferredRoute />
      </div>
      <RichTable data={data} columns={columns} isLoading={isLoading} />
    </div>
  );
}
