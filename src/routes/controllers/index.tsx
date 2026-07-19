import { TrainingApplicationCreateModal } from "@/components/atc-training/training-application-create";
import { BecomeController } from "@/components/controller-center/become-controller";
import { IdentityChip } from "@/components/controller-center/identity-chip";
import { MyEventBookings } from "@/components/controller-center/my-event-bookings";
import { ResourceGrid } from "@/components/controller-center/resource-grid";
import { TrainingBrowser } from "@/components/controller-center/training-browser";
import { MANAGEMENT_ROLES, TrainingManagement } from "@/components/controller-center/training-management";
import { CenterView, resolveCenterView } from "@/lib/center-view";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

interface CenterSearch {
  view?: "management";
}

export const Route = createFileRoute("/controllers/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): CenterSearch =>
    search["view"] === "management" ? { view: "management" } : {},
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Controller Center`) }],
  }),
});

interface ViewTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const ViewTab: React.FC<ViewTabProps> = ({ active, onClick, children }: ViewTabProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "cursor-pointer border-b-2 pb-1 text-2xl font-medium transition-colors",
      active
        ? "border-vatprc"
        : "border-transparent text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200",
    )}
  >
    {children}
  </button>
);

function RouteComponent() {
  const { view: viewParam } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
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
  const canManage = MANAGEMENT_ROLES.some((role) => roles.includes(role));
  const view = resolveCenterView(viewParam, canManage);

  const setView = (next: CenterView) =>
    void navigate({
      search: next === "management" ? { view: "management" } : {},
      replace: true,
    });

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
      {isController || canManage ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-8">
            {canManage ? (
              <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-6">
                    <ViewTab active={view === "mine"} onClick={() => setView("mine")}>
                      <Trans>My Trainings</Trans>
                    </ViewTab>
                    <ViewTab active={view === "management"} onClick={() => setView("management")}>
                      <Trans>Training Management</Trans>
                    </ViewTab>
                  </div>
                  {view === "mine" && <TrainingApplicationCreateModal />}
                </div>
                {view === "management" ? <TrainingManagement /> : <TrainingBrowser hideHeader />}
              </section>
            ) : (
              <TrainingBrowser />
            )}
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
