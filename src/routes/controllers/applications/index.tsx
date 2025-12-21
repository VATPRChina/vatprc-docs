import { AtcApplicationList } from "@/components/atc-application-list";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex flex-col items-start gap-4">
      <h1 className="text-2xl">
        <Trans>ATC Applications</Trans>
      </h1>
      <Button variant="outline" renderRoot={(props) => <Link to="/controllers/applications/new" {...props} />}>
        <Trans>Apply</Trans>
      </Button>
      <AtcApplicationList />
    </div>
  );
}
