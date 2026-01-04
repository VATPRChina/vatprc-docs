import { RequireRole } from "../require-role";
import { $api, useUser } from "@/lib/client";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Button, ComboboxData, Divider, Modal, Select, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FC, useState } from "react";

interface TrainingApplicationResponsesModalProps {
  id: string;
}

export const TrainingApplicationResponsesModal: FC<TrainingApplicationResponsesModalProps> = ({ id }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const user = useUser();
  const [opened, { toggle, close }] = useDisclosure(false);

  const { data: application } = $api.useQuery(
    "get",
    "/api/atc/trainings/applications/{id}",
    { params: { path: { id } } },
    { enabled: opened },
  );
  const { data } = $api.useQuery(
    "get",
    "/api/atc/trainings/applications/{id}/responses",
    { params: { path: { id } } },
    { enabled: opened },
  );

  const slots: ComboboxData = [
    ...(application?.slots?.map((slot) => ({
      value: slot.id,
      label: `${format(slot.start_at, "yyyy-MM-dd HH:mm'Z'", { in: utc })} - ${format(slot.end_at, "yyyy-MM-dd HH:mm'Z'", { in: utc })}`,
    })) ?? []),
    { value: "", label: t`Reject` },
  ];

  const [slotId, setSlotId] = useState("");
  const [comment, setComment] = useState("");
  const { mutate, isPending } = $api.useMutation("put", "/api/atc/trainings/applications/{id}/response", {
    onSuccess: async () => {
      await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/applications"));
      await queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/atc/trainings/applications/{id}/responses", { params: { path: { id } } }),
      );
    },
  });

  return (
    <>
      <Button onClick={toggle} variant="subtle" size="compact-sm">
        <Trans>View</Trans>
      </Button>
      <Modal opened={opened} onClose={close} size="xl" title={t`Training Application Responses`}>
        <div className="flex flex-col gap-2">
          <RequireRole role="controller-training-mentor">
            {user?.id && data?.some((response) => response.trainer_id === user?.id) && (
              <Alert color="green" title={<Trans>You have responded to this training request.</Trans>} />
            )}
            <Select label={t`Time`} data={slots} value={slotId} onChange={(value) => setSlotId(value ?? "")} />
            <Textarea label={t`Comment`} onChange={(e) => setComment(e.target.value)} autosize minRows={2} />
            <div className="flex flex-row gap-2">
              <Button
                variant="subtle"
                size="compact-sm"
                loading={isPending}
                onClick={() => mutate({ params: { path: { id } }, body: { slot_id: slotId || null, comment } })}
              >
                <Trans>Respond</Trans>
              </Button>
            </div>
          </RequireRole>
          {data?.map((response) => (
            <>
              <Divider />
              <div className="flex flex-row items-center gap-1">
                <span className="text-dimmed">
                  <Trans>Trainer</Trans>
                </span>
                <span>{response.trainer.full_name}</span>
                <span>{response.trainer.cid}</span>
                {response.is_accepted ? (
                  <Badge variant="outline" color="green" className="mx-4">
                    <Trans>Accepted</Trans>
                  </Badge>
                ) : (
                  <Badge variant="outline" color="red" className="mx-4">
                    <Trans>Rejected</Trans>
                  </Badge>
                )}
                <span className="text-dimmed">{format(response.created_at, "yyyy-MM-dd HH:mm")}</span>
              </div>
              <p>
                <span className="text-dimmed mr-4">
                  <Trans>Comment</Trans>
                </span>
                {response.comment || <Trans>No comments</Trans>}
              </p>
            </>
          ))}
        </div>
      </Modal>
    </>
  );
};
