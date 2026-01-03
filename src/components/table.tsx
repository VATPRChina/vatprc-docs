import { Trans, useLingui } from "@lingui/react/macro";
import { Select, ActionIconGroup, ActionIcon, Table, Skeleton, UnstyledButton, TextInput } from "@mantine/core";
import { useDebouncedCallback, useDebouncedValue } from "@mantine/hooks";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortDirection,
  useReactTable,
} from "@tanstack/react-table";
import { ChangeEvent, FC, useEffect, useState } from "react";
import {
  TbChevronsLeft,
  TbChevronLeft,
  TbChevronRight,
  TbChevronsRight,
  TbChevronDown,
  TbChevronUp,
  TbSelector,
  TbSearch,
} from "react-icons/tb";

interface SortableHeaderProps {
  children: React.ReactNode;
  sorted?: false | SortDirection;
  onSort?: () => unknown;
  sortable?: boolean;
}

const SortableHeader: FC<SortableHeaderProps> = ({ children, sorted, onSort, sortable }) => {
  const Icon = sorted ? (sorted === "asc" ? TbChevronUp : TbChevronDown) : TbSelector;

  if (!sortable) return children;

  return (
    <UnstyledButton onClick={onSort} className="w-full">
      <div className="flex flex-row items-center justify-between gap-2">
        <div>{children}</div>
        <Icon size={16} />
      </div>
    </UnstyledButton>
  );
};

export interface RichTableProps<TData> {
  data?: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
}

const EMPTY_TABLE = [] as never[];

export const RichTable = <TData,>({ data, columns, isLoading }: RichTableProps<TData>) => {
  const { t } = useLingui();

  const table = useReactTable({
    data: data ?? EMPTY_TABLE,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const [globalFiler, setGlobalFilter] = useState("");
  const [debouncedGlobalFiler] = useDebouncedValue(globalFiler, 200);
  useEffect(() => {
    table.setGlobalFilter(debouncedGlobalFiler);
  }, [debouncedGlobalFiler]);

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const onColumnFilterChange = useDebouncedCallback((e: ChangeEvent<HTMLInputElement>) => {
    const id = e.target.getAttribute("data-field") ?? "";
    table.setColumnFilters((f) => [...f.filter((f) => f.id !== id), { id, value: e.target.value }]);
  }, 200);

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        placeholder={t`Search...`}
        leftSection={<TbSearch size={16} />}
        value={globalFiler}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers?.map((header) => (
                <Table.Th key={`${headerGroup.id}/${header.id}`}>
                  <SortableHeader
                    key={header.id}
                    sorted={header.column.getIsSorted()}
                    onSort={() => header.column.toggleSorting()}
                    sortable={header.column.getCanSort()}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </SortableHeader>
                  <TextInput
                    className="font-normal"
                    size="xs"
                    data-field={header.column.id}
                    onChange={onColumnFilterChange}
                  />
                </Table.Th>
              )),
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
              ))}
            </Table.Tr>
          ))}
          {isLoading &&
            Array(table.getState().pagination.pageSize)
              .fill(0)
              .map((_, i) => (
                <Table.Tr key={i}>
                  {table.getAllColumns().map((col) => (
                    <Table.Td key={col.id}>
                      <Skeleton h={24} />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
        </Table.Tbody>
      </Table>
      {table.getRowCount() === 0 && !isLoading && (
        <div className="text-dimmed flex items-center justify-center p-6">
          <Trans>No data</Trans>
        </div>
      )}
      <div className="flex items-center justify-between space-x-6 self-stretch px-2 lg:space-x-8">
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onChange={(value) => table.setPageSize(Number(value))}
          data={[10, 20, 25, 30, 40, 50, 100].map((size) => ({ value: `${size}`, label: t`${size} items/page` }))}
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
    </div>
  );
};
