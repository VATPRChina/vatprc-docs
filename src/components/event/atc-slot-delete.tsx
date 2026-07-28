import { RequireRole } from "../require-role";
import { ConfirmButton } from "../ui/confirm-button";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { FC } from "react";

interface AtcSlotDeleteButtonProps {
  eventId: string;
  positionId: string;
}

export const AtcSlotDeleteButton: FC<AtcSlotDeleteButtonProps> = ({ eventId, positionId }) => {
  const queryClient = useQueryClient();

  const onSuccess = async () => {
    await queryClient.invalidateQueries(
      $api.queryOptions("get", "/api/events/{event_id}/controllers", { params: { path: { event_id: eventId } } }),
    );
  };
  const { mutate, error, isPending } = $api.useMutation("delete", "/api/events/{event_id}/controllers/{position_id}", {
    onSuccess,
  });

  return (
    <RequireRole role="event-coordinator">
      <div className="flex flex-col gap-1">
        {error && (
          <Alert color="red" title={error.title}>
            {error.detail}
          </Alert>
        )}
        <ConfirmButton
          variant="subtle"
          size="compact-sm"
          actionDescription={<Trans>Are you sure to delete this ATC position?</Trans>}
          onClick={() => mutate({ params: { path: { event_id: eventId, position_id: positionId } } })}
          loading={isPending}
        >
          <Trans>Delete</Trans>
        </ConfirmButton>
      </div>
    </RequireRole>
  );
};
