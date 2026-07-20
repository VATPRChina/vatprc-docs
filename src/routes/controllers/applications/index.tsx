import { AtcApplicationList } from "@/components/atc-application/atc-application-list";
import { RequireRole } from "@/components/require-role";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isLoading } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const roles = session?.user?.roles ?? [];

  if (isLoading) return <Skeleton h={320} />;
  if (!roles.includes("controller-training-director-assistant")) return <Navigate to="/controllers" replace />;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">
          <Trans>Review</Trans>
        </h2>
        <RequireRole role="volunteer">
          <Link to="/controllers/applications/audit" className="text-sm underline">
            <Trans>View audit logs</Trans>
          </Link>
        </RequireRole>
      </div>
      <AtcApplicationList />
    </section>
  );
}
