import { TrainingApplicationCreateModal } from "@/components/atc-training/training-application-create";
import { TrainingApplicationList } from "@/components/atc-training/training-application-list";
import { Trans } from "@lingui/react/macro";
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
        <Trans>Applications</Trans>
      </h1>
      <div className="flex flex-row gap-2">
        <TrainingApplicationCreateModal />
      </div>
      <TrainingApplicationList />
    </div>
  );
}
