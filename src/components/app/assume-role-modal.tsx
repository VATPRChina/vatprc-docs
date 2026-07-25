import { assumedRolesAtom, UserRole } from "@/lib/client";
import { USER_ROLES } from "@/lib/user-roles";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Checkbox, Group, Modal, Stack } from "@mantine/core";
import { useAtom } from "jotai";
import { FC, useEffect, useState } from "react";

interface AssumeRoleModalProps {
  opened: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const AssumeRoleModal: FC<AssumeRoleModalProps> = ({ opened, onClose, onSaved }) => {
  const { i18n } = useLingui();
  const [assumedRoles, setAssumedRoles] = useAtom(assumedRolesAtom);
  const [roles, setRoles] = useState<UserRole[]>(assumedRoles);

  useEffect(() => {
    if (opened) setRoles(assumedRoles);
  }, [assumedRoles, opened]);

  const onSave = () => {
    setAssumedRoles(roles);
    onSaved();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Trans>Assume Role</Trans>}>
      <Stack>
        <Checkbox.Group value={roles} onChange={setRoles}>
          <Stack gap="xs">
            {USER_ROLES.entries().map(([role, name]) => (
              <Checkbox key={role} value={role} label={i18n._(name)} />
            ))}
          </Stack>
        </Checkbox.Group>
        <Group>
          <Button variant="outline" size="xs" onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button size="xs" onClick={onSave}>
            <Trans>Save changes</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
