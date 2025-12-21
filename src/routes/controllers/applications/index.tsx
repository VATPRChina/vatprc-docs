import { RichTable } from "@/components/table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button, Skeleton } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

export const Route = createFileRoute("/controllers/applications/")({
  component: RouteComponent,
});

const columnHelper = createColumnHelper<components["schemas"]["AtcApplicationSummaryDto"]>();

export const columns = [
  columnHelper.accessor("id", { header: () => <Trans>ID</Trans> }),
  columnHelper.accessor("user.cid", { header: () => <Trans>CID</Trans> }),
  columnHelper.accessor("user.full_name", { header: () => <Trans>Name</Trans> }),
  columnHelper.accessor("status", { header: () => <Trans>Status</Trans> }),
  columnHelper.accessor("applied_at", { header: () => <Trans>Applied At</Trans> }),
];

function RouteComponent() {
  const { data, isLoading } = $api.useQuery("get", "/api/atc/applications");
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
    <div className="container mx-auto flex flex-col items-start gap-4">
      <h1 className="text-2xl">
        <Trans>ATC Applications</Trans>
      </h1>
      <Button variant="outline" renderRoot={(props) => <Link to="/controllers/applications/new" {...props} />}>
        <Trans>Apply</Trans>
      </Button>
      {isLoading && <Skeleton />}
      <RichTable table={table} />
    </div>
  );
}
