import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { $api, logout } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
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
        <HoverCardTrigger asChild>
          <Button variant="ghost">{data.user.full_name}</Button>
        </HoverCardTrigger>
        <HoverCardContent align="end" className="w-auto px-0 py-1" asChild>
          <ul className="flex cursor-default flex-col">
            <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
              <li onClick={onLogout}>
                <Trans>Logout</Trans>
              </li>
            </Button>
          </ul>
        </HoverCardContent>
      </HoverCard>
    );
  }

  if (!error) {
    <Button asChild variant="ghost">
      <Trans>Loading</Trans>
    </Button>;
  }

  const url = new URL("/auth/authorize", import.meta.env.VITE_API_AUTH_ENDPOINT);
  url.searchParams.set("client_id", import.meta.env.VITE_API_CLIENT_ID);
  url.searchParams.set("redirect_uri", import.meta.env.VITE_API_REDIRECT_URI);
  url.searchParams.set("response_type", "code");

  return (
    <Button asChild variant="ghost">
      <a href={url.toString()}>
        <Trans>Login</Trans>
      </a>
    </Button>
  );
};
