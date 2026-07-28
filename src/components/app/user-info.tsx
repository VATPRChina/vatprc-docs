import { AssumeRoleModal } from "./assume-role-modal";
import { RequireRole } from "@/components/require-role";
import { $api, assumedRolesAtom, logout } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button, Indicator, Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";

export const UserInfo = () => {
  const { data, error } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const client = useQueryClient();
  const assumedRoles = useAtomValue(assumedRolesAtom);
  const [assumeRoleOpened, { open: openAssumeRole, close: closeAssumeRole }] = useDisclosure(false);

  const onLogout = () => {
    (async () => {
      await logout();
      await client.resetQueries();
    })().catch(console.error);
  };

  if (data?.user) {
    return (
      <>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button variant="subtle" color="gray">
              {data.user.full_name}
            </Button>
          </Menu.Target>

          <Menu.Dropdown className="flex flex-col gap-1">
            <Menu.Item renderRoot={(props) => <Link to="/users/me" {...props} />}>
              <Trans>User Info</Trans>
            </Menu.Item>
            <RequireRole role="software-engineer">
              <Indicator color="green" disabled={assumedRoles.length === 0} offset={14} position="middle-end" size={8}>
                <Menu.Item onClick={openAssumeRole}>
                  <Trans>Assume Role</Trans>
                </Menu.Item>
              </Indicator>
            </RequireRole>
            <Menu.Item onClick={onLogout}>
              <Trans>Logout</Trans>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
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
      <Button variant="subtle">
        <Trans>Loading</Trans>
      </Button>
    );
  }

  const url = new URL("/auth/authorize", import.meta.env.VITE_API_AUTH_ENDPOINT);
  url.searchParams.set("client_id", import.meta.env.VITE_API_CLIENT_ID);
  url.searchParams.set("redirect_uri", import.meta.env.VITE_API_REDIRECT_URI);
  url.searchParams.set("response_type", "code");

  const onLogin = () => {
    localStorage.setItem("pre_oauth_path", window.location.pathname);
    location.assign(url.toString());
  };

  return (
    <Button variant="subtle" onClick={onLogin}>
      <Trans>Login</Trans>
    </Button>
  );
};
