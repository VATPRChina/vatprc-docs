import { TrainingApplicationList } from "@/components/atc-training/training-application-list";
import { TrainingList } from "@/components/atc-training/training-list";
import { TrainingSaveModal } from "@/components/atc-training/training-save";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import { Trans } from "@lingui/react/macro";
import React from "react";

export const TrainingManagement: React.FC = () => (
  <Tabs defaultValue="trainings">
    <TabsList className="mb-2">
      <TabsTrigger value="trainings">
        <Trans>Trainings</Trans>
      </TabsTrigger>
      <TabsTrigger value="applications">
        <Trans>Trainee Applications</Trans>
      </TabsTrigger>
    </TabsList>
    <TabsContent value="trainings" className="flex flex-col gap-1">
      <div className="flex flex-row gap-2">
        <TrainingSaveModal />
      </div>
      <Tabs defaultValue="active">
        <TabsList className="mb-2">
          <TabsTrigger value="active">
            <Trans>Active Trainings</Trans>
          </TabsTrigger>
          <TabsTrigger value="finished">
            <Trans>Finished Trainings</Trans>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <TrainingList mode="active" />
        </TabsContent>
        <TabsContent value="finished">
          <TrainingList mode="finished" />
        </TabsContent>
      </Tabs>
    </TabsContent>
    <TabsContent value="applications">
      <TrainingApplicationList />
    </TabsContent>
  </Tabs>
);
