import { Trans, useLingui } from "@lingui/react/macro";
import { Select, ActionIconGroup, ActionIcon, Table } from "@mantine/core";
import { flexRender, Table as TTable } from "@tanstack/react-table";
import { TbChevronsLeft, TbChevronLeft, TbChevronRight, TbChevronsRight } from "react-icons/tb";

export interface RichTableProps<TData> {
  table: TTable<TData>;
}

export const RichTable = <TData,>({ table }: RichTableProps<TData>) => {
  const { t } = useLingui();

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <>
      <Table>
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <div className="flex items-center justify-between space-x-6 self-stretch px-2 lg:space-x-8">
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onChange={(value) => {
            table.setPageSize(Number(value));
          }}
          label={<Trans>Rows per page</Trans>}
          data={["10", "20", "25", "30", "40", "50"]}
        />
        <div className="flex items-center justify-center text-sm font-medium">
          <Trans>
            Page {currentPage} of {totalPages}
          </Trans>
        </div>
        <ActionIconGroup>
          <ActionIcon
            variant="subtle"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title={t`Go to first page`}
          >
            <TbChevronsLeft />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title={t`Go to previous page`}
          >
            <TbChevronLeft />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title={t`Go to next page`}
          >
            <TbChevronRight />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title={t`Go to last page`}
          >
            <TbChevronsRight />
          </ActionIcon>
        </ActionIconGroup>
      </div>
    </>
  );
};
