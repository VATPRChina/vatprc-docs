import { AtcApplicationList } from "@/components/atc-application/atc-application-list";
import { $api, useUser } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";

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
      <Button
        className="self-start"
        variant="outline"
        renderRoot={(props) => <Link to="/controllers/applications/new" {...props} />}
        disabled={
          isLoading || (data && data.filter((a) => a.user_id === user?.id && a.status !== "rejected").length > 0)
        }
      >
        <Trans>Apply</Trans>
      </Button>
      <AtcApplicationList />
    </div>
  );
}
