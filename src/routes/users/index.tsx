import { AtcPermissionModal } from "@/components/atc-permission-modal";
import { RequireRole } from "@/components/require-role";
import { RichTable } from "@/components/table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { wrapPromiseWithLog } from "@/lib/utils";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Button, Checkbox, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { MouseEvent, useState } from "react";
import { TbUserBolt, TbCheck, TbAirTrafficControl } from "react-icons/tb";

const AUTOMATIC_ROLES: components["schemas"]["UserRoleDto"][] = [
  "controller",
  "staff",
  "volunteer",
  "api-client",
  "user",
];

export const ROLES = new Map<components["schemas"]["UserRoleDto"], MessageDescriptor>([
  ["division-director", msg`Division Director`],
  ["controller-training-director", msg`Controller Training Director`],
  ["controller-training-director-assistant", msg`Controller Training Director Assistant`],
  ["controller-training-instructor", msg`Instructor`],
  ["controller-training-mentor", msg`Mentor`],
  ["controller-training-sop-editor", msg`SOP Editor`],
  ["operation-director", msg`Operation Director`],
  ["operation-director-assistant", msg`Operation Director Assistant`],
  ["operation-sector-editor", msg`Sector Editor`],
  ["operation-loa-editor", msg`LOA Editor`],
  ["event-director", msg`Event Director`],
  ["event-coordinator", msg`Event Coordinator`],
  ["event-graphics-designer", msg`Graphics Designer`],
  ["tech-director", msg`Tech Director`],
  ["tech-director-assistant", msg`Tech Director Assistant`],
  ["tech-afv-facility-engineer", msg`AFV Facility Engineer`],
  ["controller", msg`Controller`],
  ["staff", msg`Staff`],
  ["volunteer", msg`Volunteer`],
  ["api-client", msg`API Client`],
  ["user", msg`User`],
]);

const columnHelper = createColumnHelper<components["schemas"]["UserDto"]>();

const columns = [
  columnHelper.accessor("cid", {
    header: () => <Trans>CID</Trans>,
  }),
  columnHelper.accessor("full_name", {
    header: () => <Trans>Name</Trans>,
  }),
  columnHelper.accessor("direct_roles", {
    header: () => <Trans>Roles</Trans>,
    cell: ({ row, getValue }) => {
      const { i18n } = useLingui();

      const savedRoles = getValue();
      const [roles, setRoles] = useState(getValue());
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
          ? setRoles((pv) => [...pv.filter((r) => r !== role), role as components["schemas"]["UserRoleDto"]])
          : setRoles((pv) => pv.filter((r) => r !== role));

      const computedRoles = row.original.roles;

      return (
        <div className="flex flex-row items-center gap-2">
          {savedRoles.length > 0 && (
            <div className="flex flex-col flex-wrap gap-x-1">
              {savedRoles.map((role) => {
                const roleName = ROLES.get(role);
                if (!roleName) return null;
                return <span key={role}>{i18n._(roleName)}</span>;
              })}
            </div>
          )}
          <ActionIcon variant="subtle" onClick={open}>
            <TbUserBolt />
          </ActionIcon>
          <Modal opened={opened} onClose={close} title={<Trans>Edit roles</Trans>}>
            <Stack>
              {ROLES.entries().map(([role, name]) => (
                <Checkbox
                  key={role}
                  onClick={onToggleRole(role)}
                  label={i18n._(name)}
                  checked={roles.includes(role) || (computedRoles.includes(role) && AUTOMATIC_ROLES.includes(role))}
                  disabled={AUTOMATIC_ROLES.includes(role)}
                />
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
  }),
  columnHelper.display({
    id: "actions",
    header: () => <Trans>Actions</Trans>,
    cell: ({ row }) => {
      const userId = row.original.id;
      const [opened, { open, close }] = useDisclosure(false);

      return (
        <Group>
          <RequireRole role="controller-training-director-assistant">
            <Button size="xs" onClick={open} leftSection={<TbAirTrafficControl />} variant="subtle">
              <Trans>ATC Permission</Trans>
            </Button>
            <AtcPermissionModal userId={userId} opened={opened} onClose={close} />
          </RequireRole>
        </Group>
      );
    },
  }),
];

export const Route = createFileRoute("/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = $api.useQuery("get", "/api/users");

  return (
    <div className="container mx-auto">
      <RichTable data={data} columns={columns} isLoading={isLoading} />
    </div>
  );
}
