import { TrainingApplicationList } from "@/components/atc-training/training-application-list";
import { TrainingList } from "@/components/atc-training/training-list";
import { TrainingSaveModal } from "@/components/atc-training/training-save";
import { Trans } from "@lingui/react/macro";
import { Tabs } from "@mantine/core";
import React from "react";

export const MANAGEMENT_ROLES = ["controller-training-mentor", "controller-training-director-assistant"] as const;

export const TrainingManagement: React.FC = () => (
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
);
