import { MyApplicationCard } from "@/components/atc-application/my-application-card";
import { TrainingApplicationCreateModal } from "@/components/atc-training/training-application-create";
import { BecomeController } from "@/components/controller-center/become-controller";
import { MyEventBookings } from "@/components/controller-center/my-event-bookings";
import { TrainingBrowser } from "@/components/controller-center/training-browser";
import { MANAGEMENT_ROLES } from "@/components/controller-center/training-management";
import { $api } from "@/lib/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const user = session?.user;
  const roles = user?.roles ?? [];
  const { data: status } = $api.useQuery("get", "/api/users/me/atc/status", {}, { retry: false, enabled: !!user });
  const { data: applications, isLoading: isApplicationsLoading } = $api.useQuery(
    "get",
    "/api/atc/applications",
    {},
    { retry: false, enabled: !!user },
  );

  const isController = roles.includes("controller") || (status?.permissions.length ?? 0) > 0;
  const showTabs =
    MANAGEMENT_ROLES.some((role) => roles.includes(role)) || roles.includes("controller-training-director-assistant");

  if (isController) {
    return (
      <>
        {showTabs ? (
          <section className="flex flex-col gap-4">
            <div className="flex justify-end">
              <TrainingApplicationCreateModal />
            </div>
            <TrainingBrowser hideHeader />
          </section>
        ) : (
          <TrainingBrowser />
        )}
        <MyEventBookings />
      </>
    );
  }

  const canApply =
    !isApplicationsLoading &&
    !(applications ?? []).some((a) => a.user_id === user?.id && a.status !== "rejected" && a.status !== "aborted");

  return (
    <>
      <BecomeController showApply={canApply} />
      {user && <MyApplicationCard applications={applications ?? []} />}
    </>
  );
}
