import { TrainingSaveModal } from "@/components/atc-training/training-save";
import { DateTime } from "@/components/event/datetime";
import { Sheet } from "@/components/sheet";
import { useUser, $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert, Skeleton, Table } from "@mantine/core";
import { notifications } from "@mantine/notifications";
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
  const { data: training, isLoading } = $api.useQuery("get", "/api/atc/trainings/{id}", { params: { path: { id } } });

  const {
    data: applySheet,
    error,
    isLoading: isSheetLoading,
  } = $api.useQuery("get", "/api/atc/trainings/record-sheet");

  const { mutateAsync } = $api.useMutation("put", "/api/atc/trainings/{id}/record", {
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/atc/trainings/{id}", { params: { path: { id } } }),
      );
      notifications.show({
        message: <Trans>Training record saved successfully.</Trans>,
        color: "green",
      });
    },
  });

  const onSubmit: ComponentProps<typeof Sheet>["onSubmit"] = async (answers) => {
    await mutateAsync({ body: { request_answers: answers }, params: { path: { id } } });
  };

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-3xl">
          <Trans>Training</Trans>
        </h1>
        <TrainingSaveModal id={id} />
      </div>
      <Table variant="vertical" layout="fixed">
        <Table.Tbody>
          <Table.Tr>
            <Table.Th w={160}>
              <Trans>Title</Trans>
            </Table.Th>
            <Table.Td>{training?.name}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>
              <Trans>Trainee</Trans>
            </Table.Th>
            <Table.Td>
              {training?.trainee.full_name}
              <span className="text-dimmed mx-1">{training?.trainee.cid}</span>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>
              <Trans>Trainer</Trans>
            </Table.Th>
            <Table.Td>
              {training?.trainer.full_name}
              <span className="text-dimmed mx-1">{training?.trainer.cid}</span>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>
              <Trans>Start at</Trans>
            </Table.Th>
            <Table.Td>
              <DateTime>{training?.start_at}</DateTime>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>
              <Trans>End at</Trans>
            </Table.Th>
            <Table.Td>
              <DateTime>{training?.end_at}</DateTime>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>
              <Trans>Created at</Trans>
            </Table.Th>
            <Table.Td>
              <DateTime>{training?.created_at}</DateTime>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>
              <Trans>Updated at</Trans>
            </Table.Th>
            <Table.Td>
              <DateTime>{training?.updated_at}</DateTime>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      <h2 className="text-xl">
        <Trans>Self Reflection</Trans>
      </h2>
      <Alert color="blue">
        <Trans>Self reflection will be online soon. For now, please send your self reflection to your mentor.</Trans>
      </Alert>
      <h2 className="text-xl">
        <Trans>Mentor Feedback</Trans>
      </h2>
      {error && <Alert title="Error">{error.message}</Alert>}
      {isSheetLoading && <Skeleton h={256} />}
      <Sheet
        className="flex flex-col gap-2"
        sheet={applySheet}
        existingFillingAnswers={training?.record_sheet_filing ?? undefined}
        isFieldValuesLoading={isLoading}
        onSubmit={onSubmit}
        submitButtonContent={<Trans>Save</Trans>}
        isSubmitHidden={training?.trainer_id !== user?.id}
      />
    </div>
  );
}
