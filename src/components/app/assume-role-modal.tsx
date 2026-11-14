import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { assumedRolesAtom, UserRole } from "@/lib/client";
import { USER_ROLES } from "@/lib/user-roles";
import { Trans, useLingui } from "@lingui/react/macro";
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
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{<Trans>Assume Role</Trans>}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <div className="grid grid-cols-2 gap-1">
              {USER_ROLES.entries().map(([role, name]) => (
                <Label key={role} className="flex items-center gap-2">
                  <Checkbox
                    checked={roles.includes(role)}
                    onCheckedChange={(checked) =>
                      setRoles((roles) => (checked ? [...roles, role] : roles.filter((value) => value !== role)))
                    }
                    value={role}
                  />
                  <span>{i18n._(name)}</span>
                </Label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button size="xs" onClick={onClose} variant={"neutral"}>
              <Trans>Cancel</Trans>
            </Button>
            <Button size="xs" onClick={onSave}>
              <Trans>Save changes</Trans>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
