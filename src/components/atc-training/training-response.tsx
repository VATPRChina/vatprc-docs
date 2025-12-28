import { Sheet } from "../sheet";
import { $api, useUser } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Modal, Skeleton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { ComponentProps, FC } from "react";

interface TrainingRecordModalProps {
  id: string;
}

export const TrainingRecordModal: FC<TrainingRecordModalProps> = ({ id }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const [opened, { toggle, close }] = useDisclosure(false);

  const user = useUser();
  const { data: training, isLoading } = $api.useQuery(
    "get",
    "/api/atc/trainings/{id}",
    { params: { path: { id } } },
    { enabled: opened },
  );

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
    },
  });

  const onSubmit: ComponentProps<typeof Sheet>["onSubmit"] = async (answers) => {
    await mutateAsync({ body: { request_answers: answers }, params: { path: { id } } });
  };

  return (
    <>
      <Button onClick={toggle} variant="subtle" size="compact-sm">
        <Trans>Training Record</Trans>
      </Button>
      <Modal opened={opened} onClose={close} size="xl" title={t`Training Application Responses`}>
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
      </Modal>
    </>
  );
};
