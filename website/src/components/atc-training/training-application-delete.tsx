import { ConfirmButton } from "../ui/confirm-button";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { FC } from "react";

interface TrainingApplicationDeleteModalProps {
  id: string;
  disabled: boolean;
}

export const TrainingApplicationDeleteModal: FC<TrainingApplicationDeleteModalProps> = ({ id, disabled }) => {
  const queryClient = useQueryClient();

  const onSuccess = async () => {
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/applications"));
  };
  const { mutate, error, isPending } = $api.useMutation("delete", "/api/atc/trainings/applications/{id}", {
    onSuccess,
  });

  return (
    <div className="flex flex-col gap-1">
      {error && (
        <Alert color="red" title={error.title}>
          {error.detail}
        </Alert>
      )}
      <ConfirmButton
        variant="subtle"
        size="compact-sm"
        actionDescription={<Trans>Are you sure to withdraw this training application?</Trans>}
        onClick={() => mutate({ params: { path: { id } } })}
        loading={isPending}
        disabled={disabled}
      >
        <Trans>Withdraw</Trans>
      </ConfirmButton>
    </div>
  );
};
