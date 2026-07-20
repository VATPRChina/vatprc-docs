import { IdentityChip } from "@/components/controller-center/identity-chip";
import { ResourceGrid } from "@/components/controller-center/resource-grid";
import { MANAGEMENT_ROLES } from "@/components/controller-center/training-management";
import { CenterTab, resolveCenterTab } from "@/lib/center-tab";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Controller Center`) }],
  }),
});

interface CenterTabLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const CenterTabLink: React.FC<CenterTabLinkProps> = ({ to, active, children }: CenterTabLinkProps) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    className={cn(
      "border-b-2 pb-1 text-2xl font-medium transition-colors",
      active
        ? "border-vatprc"
        : "border-transparent text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200",
    )}
  >
    {children}
  </Link>
);

function RouteComponent() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const tab: CenterTab = resolveCenterTab(pathname);
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
  const canManageTrainings = MANAGEMENT_ROLES.some((role) => roles.includes(role));
  const canReviewApplications = roles.includes("controller-training-director-assistant");
  const hasInternalRole = isController || canManageTrainings || canReviewApplications;
  const showTabs = canManageTrainings || canReviewApplications;

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
      {showTabs && (
        <div className="flex flex-wrap items-baseline gap-6">
          <CenterTabLink to="/controllers" active={tab === "mine"}>
            <Trans>My Trainings</Trans>
          </CenterTabLink>
          {canManageTrainings && (
            <CenterTabLink to="/controllers/trainings" active={tab === "trainings"}>
              <Trans>Training Management</Trans>
            </CenterTabLink>
          )}
          {canReviewApplications && (
            <CenterTabLink to="/controllers/applications" active={tab === "applications"}>
              <Trans>Application Review</Trans>
            </CenterTabLink>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <Outlet />
        </div>
        <aside className="xl:sticky xl:top-20 xl:self-start">
          {hasInternalRole ? <ResourceGrid compact /> : <ResourceGrid publicOnly />}
        </aside>
      </div>
    </div>
  );
}
