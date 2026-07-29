import { assumedRolesAtom, UserRole } from "@/lib/client";
import { USER_ROLES } from "@/lib/user-roles";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Checkbox, Modal } from "@mantine/core";
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
      <div className="flex flex-col gap-4">
        <Checkbox.Group value={roles} onChange={setRoles}>
          <div className="grid grid-cols-2 gap-1">
            {USER_ROLES.entries().map(([role, name]) => (
              <Checkbox key={role} value={role} label={i18n._(name)} />
            ))}
          </div>
        </Checkbox.Group>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="outline" size="xs" onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button size="xs" onClick={onSave}>
            <Trans>Save changes</Trans>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
