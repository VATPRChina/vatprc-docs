import { TrainingList } from "@/components/atc-training/training-list";
import { TrainingSaveModal } from "@/components/atc-training/training-save";
import { TrainingSelfReflection } from "@/components/atc-training/training-self-reflection";
import { BackButton } from "@/components/back-button";
import { DateTime } from "@/components/event/datetime";
import { Sheet } from "@/components/sheet";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TableHead, TableCell, TableRow, TableBody, Table } from "@/components/ui/table";
import { useUser, $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ComponentProps } from "react";

export const Route = createFileRoute("/controllers/trainings/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const queryClient = useQueryClient();

  const user = useUser();
  const {
    data: training,
    error: trainingError,
    isLoading,
  } = $api.useQuery("get", "/api/atc/trainings/{id}", {
    params: { path: { id } },
  });

  const {
    data: applySheet,
    error,
    isLoading: isSheetLoading,
  } = $api.useQuery("get", "/api/atc/trainings/record-sheet");

  const {
    mutateAsync,
    error: mutationError,
    isSuccess,
  } = $api.useMutation("put", "/api/atc/trainings/{id}/record", {
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/atc/trainings/{id}", { params: { path: { id } } }),
      );
    },
  });

  const onSubmit: ComponentProps<typeof Sheet>["onSubmit"] = async (answers) => {
    await mutateAsync({ body: { request_answers: answers }, params: { path: { id } } });
  };

  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      {trainingError && (
        <Alert variant={"destructive"}>
          <AlertTitle>{trainingError.title}</AlertTitle>
          <AlertDescription>{trainingError.detail}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-row items-center gap-1">
        <h2 className="text-2xl font-medium">
          <Trans>Training</Trans>
        </h2>
        <TrainingSaveModal id={id} />
      </div>
      <Table>
        <TableBody>
          <TableRow>
            <TableHead>
              <Trans>Title</Trans>
            </TableHead>
            <TableCell>{training?.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>
              <Trans>Trainee</Trans>
            </TableHead>
            <TableCell>
              {training?.trainee.full_name}
              <span className="text-dimmed mx-1">{training?.trainee.cid}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>
              <Trans>Trainer</Trans>
            </TableHead>
            <TableCell>
              {training?.trainer.full_name}
              <span className="text-dimmed mx-1">{training?.trainer.cid}</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>
              <Trans>Start at</Trans>
            </TableHead>
            <TableCell>
              <DateTime>{training?.start_at}</DateTime>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>
              <Trans>End at</Trans>
            </TableHead>
            <TableCell>
              <DateTime>{training?.end_at}</DateTime>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>
              <Trans>Created at</Trans>
            </TableHead>
            <TableCell>
              <DateTime>{training?.created_at}</DateTime>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>
              <Trans>Updated at</Trans>
            </TableHead>
            <TableCell>
              <DateTime>{training?.updated_at}</DateTime>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {isLoading && <Skeleton style={{ height: 160 }} />}
      {training && <TrainingSelfReflection key={training.id} training={training} />}
      <h2 className="text-xl">
        <Trans>Mentor Feedback</Trans>
      </h2>
      {isSuccess && (
        <Alert>
          <AlertDescription>
            <Trans>Training record saved successfully.</Trans>
          </AlertDescription>
        </Alert>
      )}
      {mutationError && (
        <Alert variant={"destructive"}>
          <AlertTitle>{mutationError.title}</AlertTitle>
          <AlertDescription>{mutationError.detail}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert>
          <AlertTitle>{"Error"}</AlertTitle>
          <AlertDescription>{error.title}</AlertDescription>
        </Alert>
      )}
      {isSheetLoading && <Skeleton style={{ height: 256 }} />}
      <Sheet
        className="flex flex-col gap-2"
        sheet={applySheet}
        existingFillingAnswers={training?.record_sheet_filing ?? undefined}
        isFieldValuesLoading={isLoading}
        onSubmit={onSubmit}
        submitButtonContent={<Trans>Save</Trans>}
        isSubmitHidden={training?.trainer_id !== user?.id}
      />
      <h2 className="text-xl">
        <Trans>Previous Trainings</Trans>
      </h2>
      {!training?.trainee_id && <Skeleton style={{ height: 256 }} />}
      {training?.trainee_id && <TrainingList mode="by-user/{userId}" userId={training?.trainee_id} />}
    </div>
  );
}
