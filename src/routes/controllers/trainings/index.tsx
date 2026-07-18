import { TrainingApplicationList } from "@/components/atc-training/training-application-list";
import { TrainingList } from "@/components/atc-training/training-list";
import { TrainingSaveModal } from "@/components/atc-training/training-save";
import { LinkButton } from "@/components/ui/link-button";
import { usePermissions } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert, Tabs } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/trainings/")({
  component: RouteComponent,
});

const MANAGEMENT_ROLES = ["controller-training-mentor", "controller-training-director-assistant"] as const;

function RouteComponent() {
  const roles = usePermissions();
  const canManage = MANAGEMENT_ROLES.some((role) => roles.includes(role));

  if (!canManage) {
    return (
      <div className="container mx-auto flex flex-col items-start gap-4">
        <Alert color="blue" title={<Trans>Looking for your trainings?</Trans>}>
          <Trans>Your training sessions and applications now live in the Controller Center.</Trans>
        </Alert>
        <LinkButton to="/controllers" variant="outline">
          <Trans>Go to Controller Center</Trans>
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>Training Management</Trans>
      </h1>
      <Tabs defaultValue="trainings">
        <Tabs.List className="mb-2">
          <Tabs.Tab value="trainings">
            <Trans>Trainings</Trans>
          </Tabs.Tab>
          <Tabs.Tab value="applications">
            <Trans>Trainee Applications</Trans>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="trainings" className="flex flex-col gap-3">
          <div className="flex flex-row gap-2">
            <TrainingSaveModal />
          </div>
          <Tabs defaultValue="active">
            <Tabs.List className="mb-2">
              <Tabs.Tab value="active">
                <Trans>Active Trainings</Trans>
              </Tabs.Tab>
              <Tabs.Tab value="finished">
                <Trans>Finished Trainings</Trans>
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="active">
              <TrainingList mode="active" />
            </Tabs.Panel>
            <Tabs.Panel value="finished">
              <TrainingList mode="finished" />
            </Tabs.Panel>
          </Tabs>
        </Tabs.Panel>

        <Tabs.Panel value="applications">
          <TrainingApplicationList />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
