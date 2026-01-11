import { AtcApplicationList } from "@/components/atc-application/atc-application-list";
import { LinkButton } from "@/components/ui/link-button";
import { $api, useUser } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();
  const { data, isLoading } = $api.useQuery("get", "/api/atc/applications");

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <h1 className="text-2xl">
        <Trans>ATC Applications</Trans>
      </h1>
      <LinkButton
        className="self-start"
        variant="outline"
        to="/controllers/applications/new"
        disabled={
          isLoading || (data && data.filter((a) => a.user_id === user?.id && a.status !== "rejected").length > 0)
        }
      >
        <Trans>Apply</Trans>
      </LinkButton>
      <AtcApplicationList />
    </div>
  );
}
