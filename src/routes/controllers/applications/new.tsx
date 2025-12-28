import { AtcApplicationForm } from "@/components/atc-application/atc-application-form";
import { BackButton } from "@/components/back-button";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex flex-col gap-4">
      <BackButton />
      <h1 className="text-2xl">
        <Trans>New ATC Application</Trans>
      </h1>
      <AtcApplicationForm />
    </div>
  );
}
