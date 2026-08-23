import { MyApplicationCard } from "@/components/atc-application/my-application-card";
import { TrainingApplicationCreateModal } from "@/components/atc-training/training-application-create";
import { BecomeController } from "@/components/controller-center/become-controller";
import { useCenterRoles } from "@/components/controller-center/center-context";
import { MyEventBookings } from "@/components/controller-center/my-event-bookings";
import { QuarterlyControllingTime } from "@/components/controller-center/quarterly-controlling-time";
import { TrainingBrowser } from "@/components/controller-center/training-browser";
import { $api } from "@/lib/client";
import { Alert } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId, isController, canManageTrainings, canReviewApplications } = useCenterRoles();
  const {
    data: applications,
    error: applicationsError,
    isLoading: isApplicationsLoading,
  } = $api.useQuery("get", "/api/atc/applications", {}, { retry: false, enabled: !!userId && !isController });

  const showTabs = canManageTrainings || canReviewApplications;

  if (isController) {
    return (
      <>
        {showTabs ? (
          <section className="flex flex-col gap-1">
            <div className="flex justify-end">
              <TrainingApplicationCreateModal />
            </div>
            <TrainingBrowser hideHeader />
          </section>
        ) : (
          <TrainingBrowser />
        )}
        <MyEventBookings />
        <QuarterlyControllingTime />
      </>
    );
  }

  const canApply =
    !isApplicationsLoading &&
    !(applications ?? []).some((a) => a.user_id === userId && a.status !== "rejected" && a.status !== "aborted");

  return (
    <>
      {applicationsError && (
        <Alert color="red" title={applicationsError.title}>
          {applicationsError.detail}
        </Alert>
      )}
      <BecomeController showApply={canApply} />
      {userId && <MyApplicationCard applications={applications ?? []} />}
    </>
  );
}
