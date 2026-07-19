import { BecomeController } from "@/components/controller-center/become-controller";
import { IdentityChip } from "@/components/controller-center/identity-chip";
import { MyEventBookings } from "@/components/controller-center/my-event-bookings";
import { ResourceGrid } from "@/components/controller-center/resource-grid";
import { TrainingBrowser } from "@/components/controller-center/training-browser";
import { $api } from "@/lib/client";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Controller Center`) }],
  }),
});

function RouteComponent() {
  const { data: session, isLoading: isSessionLoading } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const user = session?.user;
  const roles = user?.roles ?? [];
  const { data: status, isLoading: isStatusLoading } = $api.useQuery(
    "get",
    "/api/users/me/atc/status",
    {},
    { retry: false, enabled: !!user },
  );

  const isPending = isSessionLoading || (!!user && isStatusLoading);
  const isController = roles.includes("controller") || (status?.permissions.length ?? 0) > 0;

  if (isPending) {
    return (
      <div className="container mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-medium">
          <Trans>Controller Center</Trans>
        </h1>
        <Skeleton h={320} />
        <Skeleton h={140} />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-medium">
          <Trans>Controller Center</Trans>
        </h1>
        {isController && <IdentityChip />}
      </div>
      {isController ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <TrainingBrowser />
            <MyEventBookings />
          </div>
          <aside className="xl:sticky xl:top-20 xl:self-start">
            <ResourceGrid compact />
          </aside>
        </div>
      ) : (
        <>
          <BecomeController />
          <ResourceGrid publicOnly />
        </>
      )}
    </div>
  );
}
