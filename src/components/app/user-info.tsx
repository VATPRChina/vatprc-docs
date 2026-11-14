import { AssumeRoleModal } from "./assume-role-modal";
import { ExperimentalFeatures } from "./experimental-features";
import { RequireRole } from "@/components/require-role";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { $api, assumedRolesAtom, logout, redirectToLogin } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState as useDisclosureState } from "react";

export const UserInfo = () => {
  const { data, error } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const client = useQueryClient();
  const assumedRoles = useAtomValue(assumedRolesAtom);
  const [assumeRoleOpened, setAssumeRoleOpened] = useDisclosureState(false);
  const openAssumeRole = () => setAssumeRoleOpened(true);
  const closeAssumeRole = () => setAssumeRoleOpened(false);

  const onLogout = () => {
    (async () => {
      await logout();
      await client.resetQueries();
    })().catch(console.error);
  };

  if (data?.user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant={"neutral"} />}>{data.user.full_name}</DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col gap-1">
            <DropdownMenuItem render={<Link to="/users/me" />}>
              <Trans>User Info</Trans>
            </DropdownMenuItem>
            <RequireRole role="software-engineer">
              <span className={"relative"}>
                <DropdownMenuItem onClick={openAssumeRole}>
                  <Trans>Assume Role</Trans>
                </DropdownMenuItem>
                {!(assumedRoles.length === 0) && (
                  <span className="absolute top-0 right-0 size-2 rounded-full bg-green-500" />
                )}
              </span>
            </RequireRole>
            <ExperimentalFeatures />
            <DropdownMenuItem onClick={onLogout}>
              <Trans>Logout</Trans>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <RequireRole role="software-engineer">
          <AssumeRoleModal
            opened={assumeRoleOpened}
            onClose={closeAssumeRole}
            onSaved={() => void client.invalidateQueries()}
          />
        </RequireRole>
      </>
    );
  }

  if (!data && !error) {
    return (
      <Button variant={"neutral"}>
        <Trans>Loading</Trans>
      </Button>
    );
  }

  return (
    <Button onClick={redirectToLogin} variant={"neutral"}>
      <Trans>Login</Trans>
    </Button>
  );
};
