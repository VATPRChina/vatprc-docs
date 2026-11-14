import { DateTime } from "../event/datetime";
import { RequireRole } from "../require-role";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { $api, useUser } from "@/lib/client";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState as useDisclosureState } from "react";
import { FC, useState } from "react";

interface TrainingApplicationResponsesModalProps {
  id: string;
}

export const TrainingApplicationResponsesModal: FC<TrainingApplicationResponsesModalProps> = ({ id }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const user = useUser();
  const [opened, setOpened] = useDisclosureState(false);
  const toggle = () => setOpened((value) => !value);
  const close = () => setOpened(false);

  const { data: application, error: applicationError } = $api.useQuery(
    "get",
    "/api/atc/trainings/applications/{id}",
    { params: { path: { id } } },
    { enabled: opened },
  );
  const { data, error: responsesError } = $api.useQuery(
    "get",
    "/api/atc/trainings/applications/{id}/responses",
    { params: { path: { id } } },
    { enabled: opened },
  );

  const slots = [
    ...(application?.slots?.map((slot) => ({
      value: slot.id,
      label: `${format(slot.start_at, "yyyy-MM-dd HH:mm'Z'", { in: utc })} - ${format(slot.end_at, "yyyy-MM-dd HH:mm'Z'", { in: utc })}`,
    })) ?? []),
    { value: "", label: t`Reject` },
  ];

  const [slotId, setSlotId] = useState("");
  const [comment, setComment] = useState("");
  const {
    mutate,
    error: mutationError,
    isPending,
  } = $api.useMutation("put", "/api/atc/trainings/applications/{id}/response", {
    onSuccess: async () => {
      await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/applications"));
      await queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/atc/trainings/applications/{id}/responses", { params: { path: { id } } }),
      );
    },
  });

  return (
    <>
      <Button onClick={toggle} variant={"neutral"} size={"sm"}>
        <Trans>View</Trans>
      </Button>
      <Dialog
        open={opened}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t`Training Application Responses`}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {(applicationError ?? responsesError ?? mutationError) && (
              <Alert variant={"destructive"}>
                <AlertTitle>{(applicationError ?? responsesError ?? mutationError)?.title}</AlertTitle>
                <AlertDescription>{(applicationError ?? responsesError ?? mutationError)?.detail}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-dimmed mr-1">
                  <Trans>Created at</Trans>
                </span>
                <DateTime>{application?.created_at}</DateTime>
              </div>
              <div>
                <span className="text-dimmed mr-1">
                  <Trans>Updated at</Trans>
                </span>
                <DateTime>{application?.updated_at}</DateTime>
              </div>
            </div>
            <RequireRole role="controller-training-mentor">
              {user?.id && data?.some((response) => response.trainer_id === user?.id) && (
                <Alert>
                  <AlertTitle>{<Trans>You have responded to this training request.</Trans>}</AlertTitle>
                  <AlertDescription></AlertDescription>
                </Alert>
              )}
              <fieldset>
                <RadioGroup
                  value={slotId}
                  onValueChange={(value) => {
                    if (typeof value === "string") setSlotId(value);
                  }}
                >
                  <legend>{t`Time`}</legend>
                  <div className="mt-1 flex flex-col gap-2">
                    {slots.map((slot) => (
                      <Label key={slot.value} className="flex items-center gap-2">
                        <RadioGroupItem value={slot.value} />
                        {slot.label}
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </fieldset>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Comment`}</span>
                <Textarea aria-label={t`Comment`} onChange={(e) => setComment(e.target.value)} rows={2} />
              </label>
              <div className="flex flex-row gap-1">
                <Button
                  onClick={() => mutate({ params: { path: { id } }, body: { slot_id: slotId || null, comment } })}
                  disabled={isPending}
                  aria-busy={isPending}
                  variant={"neutral"}
                  size={"sm"}
                >
                  <Trans>Respond</Trans>
                </Button>
              </div>
            </RequireRole>
            {data?.length === 0 && (
              <Alert>
                <AlertTitle>{<Trans>There is no response to this training request yet.</Trans>}</AlertTitle>
                <AlertDescription></AlertDescription>
              </Alert>
            )}
            {data?.map((response) => (
              <>
                <hr />
                <div className="flex flex-row items-center gap-1">
                  <span className="text-dimmed">
                    <Trans>Trainer</Trans>
                  </span>
                  <span>{response.trainer.full_name}</span>
                  <span>{response.trainer.cid}</span>
                  {response.is_accepted ? (
                    <Badge className="mx-1">
                      <Trans>Accepted</Trans>
                    </Badge>
                  ) : (
                    <Badge className="mx-1">
                      <Trans>Rejected</Trans>
                    </Badge>
                  )}
                  <span className="text-dimmed">{format(response.created_at, "yyyy-MM-dd HH:mm")}</span>
                </div>
                <p>
                  <span className="text-dimmed mr-1">
                    <Trans>Comment</Trans>
                  </span>
                  {response.comment || <Trans>No comments</Trans>}
                </p>
              </>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
