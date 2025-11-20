import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import {
  TbChevronsLeft,
  TbChevronLeft,
  TbChevronRight,
  TbChevronsRight,
  TbArrowsUpDown,
  TbUserBolt,
  TbPlus,
  TbMinus,
  TbCheck,
} from "react-icons/tb";

const ALL_ROLES = [
  "staff",
  "volunteer",
  "director",
  "controller-training-director",
  "controller-training-director-assistant",
  "controller-training-instructor",
  "controller-training-mentor",
  "controller-training-sop-editor",
  "operation-director",
  "operation-director-assistant",
  "operation-sector-editor",
  "operation-loa-editor",
  "event-director",
  "event-coordinator",
  "event-graphics-designer",
  "tech-director",
  "tech-director-assistant",
  "tech-afv-facility-engineer",
  "controller",
];

export const columns: ColumnDef<components["schemas"]["UserDto"]>[] = [
  {
    accessorKey: "cid",
    header: ({ column }) => {
      return (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <Trans>CID</Trans>
          <TbArrowsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "full_name",
    header: () => <Trans>Name</Trans>,
  },
  {
    accessorKey: "direct_roles",
    header: () => <Trans>Roles</Trans>,
    cell: ({ row, getValue }) => {
      const savedRoles = getValue<string[]>();
      const [roles, setRoles] = useState(getValue<string[]>());
      const { mutate, isPending, isSuccess } = $api.useMutation("put", "/api/users/{id}/roles");
      const { refetch } = $api.useQuery("get", "/api/users");

      const onSave = () =>
        mutate(
          { params: { path: { id: row.original.id } }, body: [...roles] },
          {
            onSuccess: () => {
              refetch().catch(console.error);
            },
          },
        );
      const onAddRole = (role: string) => () => setRoles((pv) => [...pv.filter((r) => r !== role), role]);
      const onRemoveRole = (role: string) => () => setRoles((pv) => pv.filter((r) => r !== role));

      return (
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-col flex-wrap gap-x-1">
            {savedRoles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <TbUserBolt />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  <Trans>Edit roles</Trans>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-start gap-4">
                {roles.map((role) => (
                  <div key={role} className="flex w-full items-center gap-2">
                    <span className="flex-grow">{role}</span>
                    <Button size="icon" variant="outline" onClick={onRemoveRole(role)}>
                      <TbMinus />
                    </Button>
                  </div>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline">
                      <TbPlus />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {ALL_ROLES.map((role) => (
                      <DropdownMenuItem key={role} onSelect={onAddRole(role)}>
                        {role}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    <Trans>Cancel</Trans>
                  </Button>
                </DialogClose>
                <Button size="sm" type="submit" onClick={onSave}>
                  {isSuccess && <TbCheck className="mr-2" />}
                  {isPending && <Spinner />}
                  <Trans>Save changes</Trans>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
  {
    header: () => <Trans>Actions</Trans>,
    id: "actions",
  },
];

export const Route = createFileRoute("/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = $api.useQuery("get", "/api/users");
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "cid", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="container mx-auto">
      <div className="flex flex-row gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="filter-cid">
            <Trans>Search CID</Trans>
          </Label>
          <Input
            id="filter-cid"
            value={(table.getColumn("cid")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("cid")?.setFilterValue(event.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="filter-name">
            <Trans>Search Name</Trans>
          </Label>
          <Input
            id="filter-name"
            value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("full_name")?.setFilterValue(event.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className={header.id === "actions" ? "w-full" : "w-fit"}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Trans>No results.</Trans>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between space-x-6 px-2 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            <Trans>Rows per page</Trans>
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          <Trans>
            Page {currentPage} of {totalPages}
          </Trans>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              <Trans>Go to first page</Trans>
            </span>
            <TbChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              <Trans>Go to previous page</Trans>
            </span>
            <TbChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              <Trans>Go to next page</Trans>
            </span>
            <TbChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              <Trans>Go to last page</Trans>
            </span>
            <TbChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
