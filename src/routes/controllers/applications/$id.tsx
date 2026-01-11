import { AtcApplicationForm } from "@/components/atc-application/atc-application-form";
import {
  AtcApplicationStatusAlert,
  AtcApplicationStatusEdit,
} from "@/components/atc-application/atc-application-status";
import { AtcPermissionModalButton } from "@/components/atc-permission-modal";
import { BackButton } from "@/components/back-button";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { params } = Route.useMatch();

  const { data } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: params.id } },
  });

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <BackButton />
      <h1 className="text-2xl">
        <Trans>ATC Application</Trans>
      </h1>
      <AtcApplicationStatusAlert applicationId={params.id} />
      <AtcApplicationForm applicationId={params.id} />
      <h2 className="text-lg">
        <Trans>Review</Trans>
      </h2>
      <AtcApplicationStatusEdit applicationId={params.id} />
      <h2 className="text-lg">
        <Trans>User</Trans>
      </h2>
      <div className="flex flex-row gap-2">
        {data?.user_id ? <AtcPermissionModalButton userId={data?.user_id} /> : <Skeleton h={24} w={144} />}
      </div>
    </div>
  );
}
