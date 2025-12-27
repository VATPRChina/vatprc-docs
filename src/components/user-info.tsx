import { $api, logout } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button, Menu } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export const UserInfo = () => {
  const { data, error } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const client = useQueryClient();

  const onLogout = () => {
    (async () => {
      await logout();
      await client.resetQueries();
    })().catch(console.error);
  };

  if (data?.user) {
    return (
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button variant="subtle" color="gray">
            {data.user.full_name}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item renderRoot={(props) => <Link to="/users/me" {...props} />}>
            <Trans>User Info</Trans>
          </Menu.Item>
          <Menu.Item onClick={onLogout}>
            <Trans>Logout</Trans>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  }

  if (!error) {
    <Button variant="subtle">
      <Trans>Loading</Trans>
    </Button>;
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
