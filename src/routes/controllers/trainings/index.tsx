import { TrainingApplicationCreateModal } from "@/components/atc-training/training-application-create";
import { TrainingApplicationList } from "@/components/atc-training/training-application-list";
import { TrainingList } from "@/components/atc-training/training-list";
import { Trans } from "@lingui/react/macro";
import { Tabs } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/trainings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>ATC Trainings</Trans>
      </h1>
      <h1 className="text-xl">
        <Trans>Trainings</Trans>
      </h1>
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
      <h1 className="text-xl">
        <Trans>Applications</Trans>
      </h1>
      <div className="flex flex-row gap-2">
        <TrainingApplicationCreateModal />
      </div>
      <TrainingApplicationList />
    </div>
  );
}
