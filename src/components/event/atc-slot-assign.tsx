import { UserInput } from "../user-input";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { $api } from "@/lib/client";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/helpers";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useState as useDisclosureState } from "react";
import { FormEvent } from "react";

export const AssignAtcSlot = ({ eventId, positionId }: { eventId: string; positionId: string }) => {
  const { t } = useLingui();
  const [opened, setOpened] = useDisclosureState(false);
  const toggle = () => setOpened((value) => !value);
  const close = () => setOpened(false);

  const queryClient = useQueryClient();
  const {
    data: slots,
    error: loadError,
    isLoading,
  } = $api.useQuery("get", "/api/events/{event_id}/controllers", {
    params: { path: { event_id: eventId } },
  });
  const slot = slots?.find((s) => s.id === positionId);
  const callsign = slot?.callsign;

  const onSuccess = wrapPromiseWithLog(async () => {
    close();
    await queryClient.invalidateQueries({
      queryKey: $api.queryOptions("get", "/api/events/{event_id}/controllers", {
        params: { path: { event_id: eventId } },
      }).queryKey,
    });
  });
  const {
    mutate: assign,
    isPending: isAssignPending,
    error: assignError,
  } = $api.useMutation("put", "/api/events/{event_id}/controllers/{position_id}/booking", { onSuccess });
  const {
    mutate: unassign,
    isPending: isUnassignPending,
    error: unassignError,
  } = $api.useMutation("delete", "/api/events/{event_id}/controllers/{position_id}/booking", { onSuccess });

  const form = useForm({
    defaultValues: {
      user_id: slot?.booking?.user?.id ?? "",
    },
    onSubmit: ({ value }) => {
      assign({
        params: { path: { event_id: eventId, position_id: positionId } },
        body: value,
      });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    promiseWithLog(form.handleSubmit());
  };
  const onUnassign = () => {
    unassign({ params: { path: { event_id: eventId, position_id: positionId } } });
  };

  return (
    <>
      <Button onClick={toggle} variant={"neutral"} size={"sm"}>
        <Trans>Assign</Trans>
      </Button>
      <Dialog
        open={opened}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t`Assign ATC Position ${callsign}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {(loadError ?? assignError ?? unassignError) && (
              <Alert variant={"destructive"}>
                <AlertTitle>{(loadError ?? assignError ?? unassignError)?.title}</AlertTitle>
                <AlertDescription>{(loadError ?? assignError ?? unassignError)?.detail}</AlertDescription>
              </Alert>
            )}
            <form.Field name="user_id">
              {(field) => (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{<Trans>CID</Trans>}</span>
                  <UserInput
                    onChange={(v) => v && field.handleChange(v)}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  />
                </label>
              )}
            </form.Field>
            <div className="flex flex-row gap-1">
              <Button type="submit" disabled={isAssignPending} aria-busy={isAssignPending} variant={"neutral"}>
                <Trans>Assign</Trans>
              </Button>
              <Button
                type="button"
                onClick={onUnassign}
                disabled={slot?.booking == null || isUnassignPending}
                aria-busy={isUnassignPending}
                variant={"neutral"}
              >
                <Trans>Unassign</Trans>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
