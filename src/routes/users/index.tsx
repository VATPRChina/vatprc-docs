import { User } from "@/components/app/user";
import { AtcPermissionModalButton } from "@/components/atc-permission-modal";
import { AuditLogTable } from "@/components/audit-log/audit-log-table";
import { RequireRole } from "@/components/require-role";
import { RichTable, RichTableFeatures } from "@/components/table";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { wrapPromiseWithLog } from "@/lib/helpers";
import { USER_ROLES } from "@/lib/user-roles";
import { Trans, useLingui } from "@lingui/react/macro";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { useState as useDisclosureState } from "react";
import { useState } from "react";
import { TbUserBolt, TbCheck, TbHistory } from "react-icons/tb";

const AUTOMATIC_ROLES: components["schemas"]["UserRole"][] = [
  "controller",
  "staff",
  "volunteer",
  "api-client",
  "user",
  "controller-training-mentor",
];

const columnHelper = createColumnHelper<RichTableFeatures, components["schemas"]["UserDto"]>();

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
      const [opened, setOpened] = useDisclosureState(false);
      const open = () => setOpened(true);
      const close = () => setOpened(false);

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

      const onToggleRole = (role: string) => (checked: boolean) =>
        checked
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
          <Button onClick={open} size={"icon-sm"} variant={"neutral"}>
            <TbUserBolt />
          </Button>
          <Dialog
            open={opened}
            onOpenChange={(open) => {
              if (!open) close();
            }}
          >
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>{<Trans>Edit roles</Trans>}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {mutationError && (
                  <Alert variant={"destructive"}>
                    <AlertTitle>{mutationError.title}</AlertTitle>
                    <AlertDescription>{mutationError.detail}</AlertDescription>
                  </Alert>
                )}
                {USER_ROLES.entries().map(([role, name]) => (
                  <Label key={role} className="flex items-center gap-2">
                    <Checkbox
                      onCheckedChange={onToggleRole(role)}
                      checked={roles.includes(role) || (computedRoles.includes(role) && AUTOMATIC_ROLES.includes(role))}
                      disabled={AUTOMATIC_ROLES.includes(role)}
                    />
                    <span>{i18n._(name)}</span>
                  </Label>
                ))}
                <div className="flex flex-wrap items-center gap-1">
                  <Button size="xs" onClick={close} variant={"neutral"}>
                    <Trans>Cancel</Trans>
                  </Button>
                  <Button size="xs" type="submit" onClick={onSave} disabled={isPending} aria-busy={isPending}>
                    {isSuccess && <TbCheck />}
                    <Trans>Save changes</Trans>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
        <Alert variant={"destructive"}>
          <AlertTitle>{(usersError ?? controllersError)?.title}</AlertTitle>
          <AlertDescription>{(usersError ?? controllersError)?.detail}</AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="users">
        <TabsList className="mb-2">
          <TabsTrigger value="users">
            <Trans>Users</Trans>
          </TabsTrigger>
          <TabsTrigger value="controllers">
            <Trans>Controllers</Trans>
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Trans>Roles</Trans>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <RichTable data={data} columns={columns} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="controllers">
          <RichTable data={controllers} columns={columns} isLoading={isLoading || isControllersLoading} />
        </TabsContent>
        <TabsContent value="roles">
          <RichTable data={usersWithRoles} columns={columns} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const UserAuditLogButton = ({ userId }: { userId: string }) => {
  const [opened, setOpened] = useDisclosureState(false);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  return (
    <>
      <Button size="xs" onClick={open} variant={"neutral"}>
        {<TbHistory />}
        <Trans>Audit Logs</Trans>
      </Button>
      {opened && (
        <Dialog
          open={opened}
          onOpenChange={(open) => {
            if (!open) close();
          }}
        >
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{<Trans>Audit Logs</Trans>}</DialogTitle>
            </DialogHeader>
            <UserAuditLogModalContent userId={userId} />
          </DialogContent>
        </Dialog>
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
