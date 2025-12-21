import { RichTable } from "./table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { localizeWithMap } from "@/lib/i18n";
import { utc } from "@date-fns/utc";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Skeleton } from "@mantine/core";
import {
  ColumnFiltersState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { FC, useState } from "react";
import { TbFileDescription } from "react-icons/tb";

const APPLICATION_STATUS: Map<components["schemas"]["AtcApplicationStatus"], MessageDescriptor> = new Map([
  ["submitted", msg`Submitted`],
  ["in-waitlist", msg`In Waitlist`],
  ["approved", msg`Accepted`],
  ["rejected", msg`Rejected`],
]);

const columnHelper = createColumnHelper<components["schemas"]["AtcApplicationSummaryDto"]>();

export const columns = [
  columnHelper.accessor("user.cid", { header: () => <Trans>CID</Trans> }),
  columnHelper.accessor("user.full_name", { header: () => <Trans>Name</Trans> }),
  columnHelper.accessor("status", {
    header: () => <Trans>Status</Trans>,
    cell: ({ getValue }) => {
      const { i18n } = useLingui();
      return localizeWithMap(APPLICATION_STATUS, getValue(), i18n);
    },
  }),
  columnHelper.accessor("applied_at", {
    header: () => <Trans>Applied At</Trans>,
    cell: ({ getValue }) => format(getValue(), "yyyy-MM-dd HH:mm'Z'", { in: utc }),
  }),
  columnHelper.display({
    id: "actions",
    header: () => <Trans>Actions</Trans>,
    cell: () => (
      <Button variant="subtle" leftSection={<TbFileDescription />}>
        <Trans>View</Trans>
      </Button>
    ),
  }),
];

export const AtcApplicationList: FC = () => {
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
    <>
      {isLoading && <Skeleton />}
      <RichTable table={table} />
    </>
  );
};
