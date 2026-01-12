import { RequireRole } from "../require-role";
import { ConfirmButton } from "../ui/confirm-button";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { FC } from "react";

interface AtcSlotDeleteButtonProps {
  eventId: string;
  positionId: string;
}

export const AtcSlotDeleteButton: FC<AtcSlotDeleteButtonProps> = ({ eventId, positionId }) => {
  const queryClient = useQueryClient();

  const onSuccess = async () => {
    close();
    await queryClient.invalidateQueries(
      $api.queryOptions("get", "/api/events/{eventId}/controllers", { params: { path: { eventId } } }),
    );
  };
  const { mutate, isPending } = $api.useMutation("delete", "/api/events/{eventId}/controllers/{positionId}", {
    onSuccess,
  });

  return (
    <RequireRole role="event-coordinator">
      <ConfirmButton
        variant="subtle"
        size="compact-sm"
        actionDescription={<Trans>Are you sure to delete this ATC position?</Trans>}
        onClick={() => mutate({ params: { path: { eventId, positionId } } })}
        loading={isPending}
      >
        <Trans>Delete</Trans>
      </ConfirmButton>
    </RequireRole>
  );
};
