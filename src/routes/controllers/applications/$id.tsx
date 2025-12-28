import { AtcApplicationForm } from "@/components/atc-application/atc-application-form";
import {
  AtcApplicationStatusAlert,
  AtcApplicationStatusEdit,
} from "@/components/atc-application/atc-application-status";
import { BackButton } from "@/components/back-button";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { params } = Route.useMatch();

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <BackButton />
      <h1 className="text-2xl">
        <Trans>ATC Application</Trans>
      </h1>
      <AtcApplicationStatusAlert applicationId={params.id} />
      <AtcApplicationForm applicationId={params.id} />
      <h1 className="text-lg">
        <Trans>Review</Trans>
      </h1>
      <AtcApplicationStatusEdit applicationId={params.id} />
    </div>
  );
}
