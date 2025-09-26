import { $api, logout } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button, HoverCard } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";

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
      <HoverCard>
        <HoverCard.Target>
          <Button variant="subtle">{data.user.full_name}</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown className="w-auto px-0 py-1">
          <Button variant="subtle" onClick={onLogout}>
            <Trans>Logout</Trans>
          </Button>
        </HoverCard.Dropdown>
      </HoverCard>
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
