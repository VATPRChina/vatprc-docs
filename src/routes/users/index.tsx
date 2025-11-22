import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { wrapPromiseWithLog } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  ActionIconGroup,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
import React, { MouseEvent, ReactNode, useState } from "react";
import {
  TbChevronsLeft,
  TbChevronLeft,
  TbChevronRight,
  TbChevronsRight,
  TbArrowsUpDown,
  TbUserBolt,
  TbCheck,
} from "react-icons/tb";

const ROLES = {
  "division-director": <Trans>Division Director</Trans>,
  "controller-training-director": <Trans>Controller Training Director</Trans>,
  "controller-training-director-assistant": <Trans>Controller Training Director Assistant</Trans>,
  "controller-training-instructor": <Trans>Instructor</Trans>,
  "controller-training-mentor": <Trans>Mentor</Trans>,
  "controller-training-sop-editor": <Trans>SOP Editor</Trans>,
  "operation-director": <Trans>Operation Director</Trans>,
  "operation-director-assistant": <Trans>Operation Director Assistant</Trans>,
  "operation-sector-editor": <Trans>Sector Editor</Trans>,
  "operation-loa-editor": <Trans>LOA Editor</Trans>,
  "event-director": <Trans>Event Director</Trans>,
  "event-coordinator": <Trans>Event Coordinator</Trans>,
  "event-graphics-designer": <Trans>Graphics Designer</Trans>,
  "tech-director": <Trans>Tech Director</Trans>,
  "tech-director-assistant": <Trans>Tech Director Assistant</Trans>,
  "tech-afv-facility-engineer": <Trans>AFV Facility Engineer</Trans>,
  controller: <Trans>Controller</Trans>,
  staff: <Trans>Staff</Trans>,
  volunteer: <Trans>Volunteer</Trans>,
} satisfies Record<Exclude<components["schemas"]["UserRoleDto"], "api-client" | "user">, ReactNode>;

export const columns: ColumnDef<components["schemas"]["UserDto"]>[] = [
  {
    accessorKey: "cid",
    header: ({ column }) => {
      return (
        <>
          <Trans>CID</Trans>
          <ActionIcon
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            variant="transparent"
            size="xs"
            c="gray"
          >
            <TbArrowsUpDown />
          </ActionIcon>
        </>
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
      const [opened, { open, close }] = useDisclosure(false);

      const onSave = () =>
        mutate(
          { params: { path: { id: row.original.id } }, body: [...roles] },
          {
            onSuccess: wrapPromiseWithLog(async () => {
              await refetch();
              close();
            }),
          },
        );

      const onToggleRole = (role: string) => (e: MouseEvent<HTMLInputElement>) =>
        e.currentTarget.checked
          ? setRoles((pv) => [...pv.filter((r) => r !== role), role])
          : setRoles((pv) => pv.filter((r) => r !== role));

      return (
        <div className="flex flex-row items-center gap-2">
          {savedRoles.length > 0 && (
            <div className="flex flex-col flex-wrap gap-x-1">
              {savedRoles.map((role) => (
                <span key={role}>{role}</span>
              ))}
            </div>
          )}
          <ActionIcon variant="subtle" onClick={open}>
            <TbUserBolt />
          </ActionIcon>
          <Modal opened={opened} onClose={close} title={<Trans>Edit roles</Trans>}>
            <Stack>
              {Object.entries(ROLES).map(([role, name]) => (
                <Checkbox key={role} onClick={onToggleRole(role)} label={name} checked={roles.includes(role)} />
              ))}
              <Group>
                <Button variant="outline" size="xs" onClick={close}>
                  <Trans>Cancel</Trans>
                </Button>
                <Button size="xs" type="submit" onClick={onSave} loading={isPending}>
                  {isSuccess && <TbCheck />}
                  <Trans>Save changes</Trans>
                </Button>
              </Group>
            </Stack>
          </Modal>
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
  const { t } = useLingui();

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
          <TextInput
            id="filter-cid"
            value={(table.getColumn("cid")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("cid")?.setFilterValue(e.target.value)}
            disabled={isLoading}
            label={<Trans>Search CID</Trans>}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <TextInput
            id="filter-name"
            value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("full_name")?.setFilterValue(e.target.value)}
            disabled={isLoading}
            label={<Trans>Search Name</Trans>}
          />
        </div>
      </div>
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
      <div className="flex items-center justify-between space-x-6 px-2 lg:space-x-8">
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
    </div>
  );
}
