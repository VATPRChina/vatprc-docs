import { RequireRole } from "../require-role";
import { ConfirmButton } from "../ui/confirm-button";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
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
    await queryClient.invalidateQueries(
      $api.queryOptions("get", "/api/events/{event_id}/controllers", { params: { path: { event_id: eventId } } }),
    );
  };
  const { mutate, error, isPending } = $api.useMutation("delete", "/api/events/{event_id}/controllers/{position_id}", {
    onSuccess,
  });

  return (
    <RequireRole role={["event-coordinator", "controller-training-mentor"]}>
      <div className="flex flex-col gap-1">
        {error && (
          <Alert variant={"destructive"}>
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>{error.detail}</AlertDescription>
          </Alert>
        )}
        <ConfirmButton
          actionDescription={<Trans>Are you sure to delete this ATC position?</Trans>}
          onClick={() => mutate({ params: { path: { event_id: eventId, position_id: positionId } } })}
          disabled={isPending}
          aria-busy={isPending}
          variant={"neutral"}
          size={"sm"}
        >
          <Trans>Delete</Trans>
        </ConfirmButton>
      </div>
    </RequireRole>
  );
};
