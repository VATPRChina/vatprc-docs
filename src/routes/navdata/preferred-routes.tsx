import { RichTable } from "@/components/table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { TextInput } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

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
  },
];

export const Route = createFileRoute("/navdata/preferred-routes")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = $api.useQuery("get", "/api/navdata/preferred-routes");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  });

  return (
    <div className="container mx-auto">
      <div className="flex flex-row gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <TextInput
            id="filter-departure"
            value={(table.getColumn("departure")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("departure")?.setFilterValue(e.target.value)}
            disabled={isLoading}
            label={<Trans>Search Departure</Trans>}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <TextInput
            id="filter-arrival"
            value={(table.getColumn("arrival")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("arrival")?.setFilterValue(e.target.value)}
            disabled={isLoading}
            label={<Trans>Search Arrival</Trans>}
          />
        </div>
      </div>
      <RichTable table={table} />
    </div>
  );
}
