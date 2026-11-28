import { login } from "@/lib/client/auth";
import { Trans } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type FC, useEffect } from "react";

interface AuthCallbackSearch {
  code: string;
}

const Component: FC = () => {
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
        <h1 className="text-dimmed text-3xl font-bold">307</h1>
        <h2 className="text-2xl font-bold">
          <Trans>Please wait while being logged in.</Trans>
        </h2>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>): AuthCallbackSearch => {
    return {
      code: ("code" in search && typeof search["code"] === "string" ? search["code"] : undefined) ?? "",
    };
  },
  component: Component,
});
