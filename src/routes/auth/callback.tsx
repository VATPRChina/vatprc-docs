import { login } from "@/lib/client/auth";
import { Trans } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

interface AuthCallbackSearch {
  code: string;
}

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>): AuthCallbackSearch => {
    return {
      code: ("code" in search && typeof search["code"] === "string" ? search["code"] : undefined) ?? "",
    };
  },
  component: Component,
});

function Component() {
  const match = Route.useMatch();
  const navigate = Route.useNavigate();
  const client = useQueryClient();

  useEffect(() => {
    (async () => {
      await login(match.search.code);
      await client.resetQueries();
      await navigate({ to: "/" });
    })().catch(console.error);
  });

  return (
    <div>
      <Trans>Please wait while being logged in.</Trans>
    </div>
  );
}
