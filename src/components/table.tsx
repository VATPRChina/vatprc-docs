import { MessageDescriptor } from "@lingui/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Select, ActionIconGroup, ActionIcon, Table, Skeleton, UnstyledButton, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  ColumnDef,
  flexRender,
  TableState,
  RowData,
  SortDirection,
  useTable,
} from "@tanstack/react-table";
import { ChangeEvent, FC } from "react";
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

const columnMeta: { filterValues?: { value: string; label: MessageDescriptor }[] } = {};

const richTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
  columnMeta,
});

export type RichTableFeatures = typeof richTableFeatures;

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
      <div className="flex flex-row items-center justify-between gap-1">
        <div>{children}</div>
        <Icon size={16} />
      </div>
    </UnstyledButton>
  );
};

export interface RichTableProps<TData extends RowData> {
  data?: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<RichTableFeatures, TData, any>[];
  isLoading?: boolean;
  initialState?: Partial<TableState<RichTableFeatures>>;
  /** Hide the global free-text search bar, e.g. when a column filter already covers the same search intent. */
  hideGlobalSearch?: boolean;
}

const EMPTY_TABLE = [] as never[];

export const RichTable = <TData extends RowData>({
  data,
  columns,
  isLoading,
  initialState,
  hideGlobalSearch,
}: RichTableProps<TData>) => {
  const { t, i18n } = useLingui();

  const table = useTable({
    features: richTableFeatures,
    data: data ?? EMPTY_TABLE,
    columns,
    initialState,
  });

  const currentPage = table.state.pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const onGlobalFilterChange = useDebouncedCallback((e: ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value);
  }, 200);

  const onColumnFilterChange = useDebouncedCallback((e: ChangeEvent<HTMLInputElement>) => {
    const id = e.target.getAttribute("data-field") ?? "";
    table.setColumnFilters((f) => [...f.filter((f) => f.id !== id), { id, value: e.target.value }]);
  }, 200);

  const onColumnFilterSelectChange = useDebouncedCallback((value: string | null, id: string) => {
    table.setColumnFilters((f) => [...f.filter((f) => f.id !== id), { id, value }]);
  }, 200);

  return (
    <div className="flex flex-col gap-1">
      {!hideGlobalSearch && (
        <TextInput placeholder={t`Search...`} leftSection={<TbSearch size={16} />} onChange={onGlobalFilterChange} />
      )}
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers?.map((header) => (
                <Table.Th key={`${headerGroup.id}/${header.id}`}>
                  <div className="flex h-full flex-col gap-1">
                    <SortableHeader
                      key={header.id}
                      sorted={header.column.getIsSorted()}
                      onSort={() => header.column.toggleSorting()}
                      sortable={header.column.getCanSort()}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </SortableHeader>
                    {header.column.getCanFilter() &&
                      (header.column.columnDef.meta?.filterValues ? (
                        <Select
                          className="font-normal"
                          size="xs"
                          data-field={header.column.id}
                          value={(table.getColumn(header.column.id)?.getFilterValue() as string) ?? null}
                          onChange={(v) => onColumnFilterSelectChange(v, header.column.id)}
                          data={header.column.columnDef.meta.filterValues.map(({ value, label }) => ({
                            value,
                            label: i18n._(label),
                          }))}
                          clearable
                        />
                      ) : (
                        <TextInput
                          className="font-normal"
                          size="xs"
                          data-field={header.column.id}
                          onChange={onColumnFilterChange}
                        />
                      ))}
                  </div>
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
            Array(Math.min(table.state.pagination.pageSize, 15))
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
      <div className="flex items-center justify-between gap-2 self-stretch px-2">
        <Select
          value={table.state.pagination.pageSize > 100 ? "all" : `${table.state.pagination.pageSize}`}
          onChange={(value) => table.setPageSize(value === "all" ? Number.MAX_SAFE_INTEGER : Number(value))}
          data={[
            ...[10, 20, 25, 30, 40, 50, 100].map((size) => ({ value: `${size}`, label: t`${size} items/page` })),
            { value: "all", label: t`All` },
          ]}
        />
        <div className="flex items-center justify-center text-sm font-medium">
          <Trans>
            Page {currentPage} of {totalPages}
          </Trans>
        </div>
        <ActionIconGroup className="gap-1!">
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
