import { ConfirmButton } from "../ui/confirm-button";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { FC } from "react";

export const TrainingApplicationDeleteModal: FC<{ id: string; disabled: boolean }> = ({ id }) => {
  const queryClient = useQueryClient();

  const onSuccess = async () => {
    close();
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/applications"));
  };
  const { mutate, isPending } = $api.useMutation("delete", "/api/atc/trainings/applications/{id}", {
    onSuccess,
  });

  return (
    <ConfirmButton
      variant="subtle"
      size="compact-sm"
      actionDescription={<Trans>Are you sure to withdraw this training application?</Trans>}
      onClick={() => mutate({ params: { path: { id } } })}
      loading={isPending}
    >
      <Trans>Withdraw</Trans>
    </ConfirmButton>
  );
};
