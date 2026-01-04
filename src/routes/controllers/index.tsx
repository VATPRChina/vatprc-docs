import { Trans } from "@lingui/react/macro";
import { Alert, Card } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto grid grid-cols-2 gap-4">
      <h1 className="col-span-2 text-3xl font-medium">
        <Trans>Controller Center</Trans>
      </h1>
      <Alert
        className="col-span-2"
        color="blue"
        title={
          <Trans>
            Controller Center is under construction. We will improve this page to contain contents that fits
            controllers&apos; needs.
          </Trans>
        }
      />
      <Card withBorder renderRoot={(props) => <Link to="/controllers/applications" {...props} />}>
        <h2 className="text-xl font-medium">
          <Trans>ATC Applications</Trans>
        </h2>
      </Card>
      <Card withBorder renderRoot={(props) => <Link to="/controllers/trainings" {...props} />}>
        <h2 className="text-xl font-medium">
          <Trans>ATC Trainings</Trans>
        </h2>
      </Card>
    </div>
  );
}
