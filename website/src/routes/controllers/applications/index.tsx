import { AtcApplicationList } from "@/components/atc-application/atc-application-list";
import { useCenterRoles } from "@/components/controller-center/center-context";
import { RequireRole } from "@/components/require-role";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import type { FC } from "react";

const RouteComponent: FC = () => {
  const { canReviewApplications } = useCenterRoles();
  if (!canReviewApplications) return <Navigate to="/controllers" replace />;

  return (
    <section className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
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
};

export const Route = createFileRoute("/controllers/applications/")({
  component: RouteComponent,
});
