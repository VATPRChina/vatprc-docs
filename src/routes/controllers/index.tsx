import { BecomeController } from "@/components/controller-center/become-controller";
import { IdentityChip } from "@/components/controller-center/identity-chip";
import { MyEventBookings } from "@/components/controller-center/my-event-bookings";
import { ResourceGrid } from "@/components/controller-center/resource-grid";
import { TrainingBrowser } from "@/components/controller-center/training-browser";
import { $api, usePermissions, useUser } from "@/lib/client";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Controller Center`) }],
  }),
});

function RouteComponent() {
  const user = useUser();
  const roles = usePermissions();
  const { data: status } = $api.useQuery("get", "/api/users/me/atc/status", {}, { retry: false, enabled: !!user });

  const isController = roles.includes("controller") || (status?.permissions.length ?? 0) > 0;

  return (
    <div className="container mx-auto flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-medium">
          <Trans>Controller Center</Trans>
        </h1>
        {isController && <IdentityChip />}
      </div>
      {isController ? (
        <>
          <TrainingBrowser />
          <MyEventBookings />
          <ResourceGrid />
        </>
      ) : (
        <>
          <BecomeController />
          <ResourceGrid publicOnly />
        </>
      )}
    </div>
  );
}
