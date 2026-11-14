import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { MessageDescriptor } from "@lingui/core";
import { Trans, useLingui } from "@lingui/react/macro";
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
    <button onClick={onSort} className="w-full" type={"button"}>
      <div className="flex flex-row items-center justify-between gap-1">
        <div>{children}</div>
        <Icon size={16} />
      </div>
    </button>
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
  /** Hide the per-column filter controls while preserving sorting and table content. */
  hideColumnFilters?: boolean;
}

const EMPTY_TABLE = [] as never[];

export const RichTable = <TData extends RowData>({
  data,
  columns,
  isLoading,
  initialState,
  hideGlobalSearch,
  hideColumnFilters,
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

  const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value);
  };

  const onColumnFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const id = e.target.getAttribute("data-field") ?? "";
    table.setColumnFilters((f) => [...f.filter((f) => f.id !== id), { id, value: e.target.value }]);
  };

  const onColumnFilterSelectChange = (value: string | null, id: string) => {
    table.setColumnFilters((f) => [...f.filter((f) => f.id !== id), { id, value }]);
  };

  return (
    <div className="flex flex-col gap-1">
      {!hideGlobalSearch && <Input placeholder={t`Search...`} onChange={onGlobalFilterChange} />}
      <Table>
        <TableHeader>
          <TableRow>
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers?.map((header) => (
                <TableHead key={`${headerGroup.id}/${header.id}`}>
                  <div className="flex h-full flex-col gap-1">
                    <SortableHeader
                      key={header.id}
                      sorted={header.column.getIsSorted()}
                      onSort={() => header.column.toggleSorting()}
                      sortable={header.column.getCanSort()}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </SortableHeader>
                    {!hideColumnFilters &&
                      header.column.getCanFilter() &&
                      (header.column.columnDef.meta?.filterValues ? (
                        <NativeSelect
                          className="font-normal"
                          data-field={header.column.id}
                          value={(table.getColumn(header.column.id)?.getFilterValue() as string) ?? ""}
                          onChange={(event) => {
                            const v = event.currentTarget.value || null;
                            return onColumnFilterSelectChange(v, header.column.id);
                          }}
                        >
                          <NativeSelectOption value=""></NativeSelectOption>
                          {(
                            header.column.columnDef.meta.filterValues.map(({ value, label }) => ({
                              value,
                              label: i18n._(label),
                            })) ?? []
                          ).map((option) => {
                            const item = typeof option === "string" ? { value: option, label: option } : option;
                            return (
                              <NativeSelectOption key={item.value} value={item.value}>
                                {item.label}
                              </NativeSelectOption>
                            );
                          })}
                        </NativeSelect>
                      ) : (
                        <Input className="font-normal" data-field={header.column.id} onChange={onColumnFilterChange} />
                      ))}
                  </div>
                </TableHead>
              )),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
          {isLoading &&
            Array(Math.min(table.state.pagination.pageSize, 15))
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  {table.getAllColumns().map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton style={{ height: 24 }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {table.getRowCount() === 0 && !isLoading && (
        <div className="text-dimmed flex items-center justify-center p-6">
          <Trans>No data</Trans>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 self-stretch px-2">
        <NativeSelect
          value={table.state.pagination.pageSize > 100 ? "all" : `${table.state.pagination.pageSize}`}
          onChange={(event) => {
            const value = event.currentTarget.value || null;
            return table.setPageSize(value === "all" ? Number.MAX_SAFE_INTEGER : Number(value));
          }}
        >
          <NativeSelectOption value=""></NativeSelectOption>
          {[
            ...[10, 20, 25, 30, 40, 50, 100].map((size) => ({ value: `${size}`, label: t`${size} items/page` })),
            { value: "all", label: t`All` },
          ].map((option) => {
            const item = typeof option === "string" ? { value: option, label: option } : option;
            return (
              <NativeSelectOption key={item.value} value={item.value}>
                {item.label}
              </NativeSelectOption>
            );
          })}
        </NativeSelect>
        <div className="flex items-center justify-center text-sm font-medium">
          <Trans>
            Page {currentPage} of {totalPages}
          </Trans>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title={t`Go to first page`}
            size={"icon-sm"}
            variant={"neutral"}
          >
            <TbChevronsLeft />
          </Button>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title={t`Go to previous page`}
            size={"icon-sm"}
            variant={"neutral"}
          >
            <TbChevronLeft />
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title={t`Go to next page`}
            size={"icon-sm"}
            variant={"neutral"}
          >
            <TbChevronRight />
          </Button>
          <Button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title={t`Go to last page`}
            size={"icon-sm"}
            variant={"neutral"}
          >
            <TbChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
