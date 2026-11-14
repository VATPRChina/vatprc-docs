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
  const client = useQueryClient();

  useEffect(() => {
    (async () => {
      await login(match.search.code);
      await client.resetQueries();
      const prev = localStorage.getItem("pre_oauth_path");
      if (prev) {
        localStorage.removeItem("pre_oauth_path");
        location.replace(prev);
      } else {
        location.replace("/");
      }
    })().catch(console.error);
  });

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-start gap-4">
        <h1 className={"font-heading text-3xl"}>307</h1>
        <h2 className={"font-heading text-3xl"}>
          <Trans>Please wait while being logged in.</Trans>
        </h2>
      </div>
    </div>
  );
}
