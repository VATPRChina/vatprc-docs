import { User } from "@/components/app/user";
import { AtcPermissionModalButton } from "@/components/atc-permission-modal";
import { AuditLogTable } from "@/components/audit-log/audit-log-table";
import { RequireRole } from "@/components/require-role";
import { RichTable } from "@/components/table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { USER_ROLES } from "@/lib/user-roles";
import { wrapPromiseWithLog } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Alert, Button, Checkbox, Modal, Tabs } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { MouseEvent, useState } from "react";
import { TbUserBolt, TbCheck, TbHistory } from "react-icons/tb";

const AUTOMATIC_ROLES: components["schemas"]["UserRole"][] = [
  "controller",
  "staff",
  "volunteer",
  "api-client",
  "user",
  "controller-training-mentor",
];

const columnHelper = createColumnHelper<components["schemas"]["UserDto"]>();

const columns = [
  columnHelper.accessor((user) => `${user.full_name} ${user.cid}`.trim(), {
    id: "user",
    header: () => <Trans>User</Trans>,
    cell: ({ row }) => <User user={row.original} />,
  }),
  columnHelper.accessor("direct_roles", {
    header: () => <Trans>Roles</Trans>,
    cell: ({ row, getValue }) => {
      const { i18n } = useLingui();

      const savedRoles = getValue();
      const [roles, setRoles] = useState(getValue());
      const { mutate, error: mutationError, isPending, isSuccess } = $api.useMutation("put", "/api/users/{id}/roles");
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
          ? setRoles((pv) => [...pv.filter((r) => r !== role), role as components["schemas"]["UserRole"]])
          : setRoles((pv) => pv.filter((r) => r !== role));

      const computedRoles = row.original.roles;

      return (
        <div className="flex flex-row items-center gap-1">
          {savedRoles.length > 0 && (
            <div className="flex flex-col flex-wrap gap-1">
              {savedRoles.map((role) => {
                const roleName = USER_ROLES.get(role);
                if (!roleName) return null;
                return <span key={role}>{i18n._(roleName)}</span>;
              })}
            </div>
          )}
          <ActionIcon variant="subtle" onClick={open}>
            <TbUserBolt />
          </ActionIcon>
          <Modal opened={opened} onClose={close} title={<Trans>Edit roles</Trans>}>
            <div className="flex flex-col gap-4">
              {mutationError && (
                <Alert color="red" title={mutationError.title}>
                  {mutationError.detail}
                </Alert>
              )}
              {USER_ROLES.entries().map(([role, name]) => (
                <Checkbox
                  key={role}
                  onClick={onToggleRole(role)}
                  label={i18n._(name)}
                  checked={roles.includes(role) || (computedRoles.includes(role) && AUTOMATIC_ROLES.includes(role))}
                  disabled={AUTOMATIC_ROLES.includes(role)}
                />
              ))}
              <div className="flex flex-wrap items-center gap-1">
                <Button variant="outline" size="xs" onClick={close}>
                  <Trans>Cancel</Trans>
                </Button>
                <Button size="xs" type="submit" onClick={onSave} loading={isPending}>
                  {isSuccess && <TbCheck />}
                  <Trans>Save changes</Trans>
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => <Trans>Actions</Trans>,
    cell: ({ row }) => {
      const userId = row.original.id;

      return (
        <div className="flex flex-wrap items-center gap-1">
          <AtcPermissionModalButton userId={userId} />
          <RequireRole role="volunteer">
            <UserAuditLogButton userId={userId} />
          </RequireRole>
        </div>
      );
    },
  }),
];

export const Route = createFileRoute("/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, error: usersError, isLoading } = $api.useQuery("get", "/api/users");
  const {
    data: controllerStatuses,
    error: controllersError,
    isLoading: isControllersLoading,
  } = $api.useQuery("get", "/api/atc/controllers");
  const controllerIds = new Set(controllerStatuses?.map((status) => status.user_id));
  const controllers = data?.filter((user) => controllerIds.has(user.id));
  const usersWithRoles = data?.filter((user) => user.direct_roles.length > 0);

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl">
          <Trans>Users</Trans>
        </h1>
        <RequireRole role="volunteer">
          <Link to="/users/audit" className="text-sm underline">
            <Trans>View audit logs</Trans>
          </Link>
        </RequireRole>
      </div>
      {(usersError ?? controllersError) && (
        <Alert color="red" title={(usersError ?? controllersError)?.title}>
          {(usersError ?? controllersError)?.detail}
        </Alert>
      )}
      <Tabs defaultValue="users">
        <Tabs.List className="mb-2">
          <Tabs.Tab value="users">
            <Trans>Users</Trans>
          </Tabs.Tab>
          <Tabs.Tab value="controllers">
            <Trans>Controllers</Trans>
          </Tabs.Tab>
          <Tabs.Tab value="roles">
            <Trans>Roles</Trans>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users">
          <RichTable data={data} columns={columns} isLoading={isLoading} />
        </Tabs.Panel>
        <Tabs.Panel value="controllers">
          <RichTable data={controllers} columns={columns} isLoading={isLoading || isControllersLoading} />
        </Tabs.Panel>
        <Tabs.Panel value="roles">
          <RichTable data={usersWithRoles} columns={columns} isLoading={isLoading} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

const UserAuditLogButton = ({ userId }: { userId: string }) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button size="xs" onClick={open} leftSection={<TbHistory />} variant="subtle">
        <Trans>Audit Logs</Trans>
      </Button>
      {opened && (
        <Modal opened={opened} onClose={close} title={<Trans>Audit Logs</Trans>} size="xl">
          <UserAuditLogModalContent userId={userId} />
        </Modal>
      )}
    </>
  );
};

const UserAuditLogModalContent = ({ userId }: { userId: string }) => {
  const { data, error, isLoading } = $api.useQuery("get", "/api/users/{id}/audit", {
    params: { path: { id: userId } },
  });

  return <AuditLogTable data={data} error={error} isLoading={isLoading} />;
};
