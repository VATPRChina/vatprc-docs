import { POSITION_KINDS_MAP, POSITION_STATE_MAP } from "../atc-permission-modal";
import { DateTimeInput } from "../ui/datetime-input";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog } from "@/lib/helpers";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO, setMinutes, setSeconds } from "date-fns";
import { useState as useDisclosureState } from "react";
import { FormEvent } from "react";

export const CreateAtcSlot = ({ eventId, positionId }: { eventId: string; positionId?: string }) => {
  const { t, i18n } = useLingui();
  const [opened, setOpened] = useDisclosureState(false);
  const toggle = () => setOpened((value) => !value);
  const close = () => setOpened(false);

  const queryClient = useQueryClient();
  const {
    data: event,
    error: eventError,
    isLoading,
  } = $api.useQuery("get", "/api/events/{id}", { params: { path: { id: eventId ?? "0" } } }, { enabled: opened });
  const { data: slots, error: slotsError } = $api.useQuery("get", "/api/events/{event_id}/controllers", {
    params: { path: { event_id: eventId } },
  });
  const slot = slots?.find((s) => s.id === positionId);
  const callsign = slot?.callsign;

  const onSuccess = () => {
    close();
    promiseWithLog(
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions("get", "/api/events/{event_id}/controllers", {
          params: { path: { event_id: eventId } },
        }).queryKey,
      }),
    );
  };
  const {
    mutate: create,
    isPending: isCreatePending,
    error: createError,
  } = $api.useMutation("post", "/api/events/{event_id}/controllers", {
    onSuccess,
  });
  const {
    mutate: update,
    isPending: isUpdatePending,
    error: updateError,
  } = $api.useMutation("put", "/api/events/{event_id}/controllers/{position_id}", { onSuccess });
  const now = formatISO(setMinutes(setSeconds(Date.now(), 0), 0));
  const form = useForm({
    defaultValues: {
      callsign: slot?.callsign ?? "",
      start_at: slot?.start_at ?? event?.start_at ?? now,
      end_at: slot?.end_at ?? event?.end_at ?? now,
      position_kind_id: slot?.position_kind_id ?? "DEL",
      minimum_controller_state: slot?.minimum_controller_state ?? "student",
      remarks: slot?.remarks ?? "",
    } satisfies components["schemas"]["EventAtcPositionSaveRequest"],
    onSubmit: ({ value }) => {
      if (positionId) {
        update({ params: { path: { event_id: eventId, position_id: positionId } }, body: value });
      } else {
        create({ params: { path: { event_id: eventId } }, body: value });
      }
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    promiseWithLog(form.handleSubmit());
  };

  return (
    <>
      {!positionId ? (
        <Button onClick={toggle} variant={"neutral"}>
          <Trans>Create ATC Position</Trans>
        </Button>
      ) : (
        <Button onClick={toggle} variant={"neutral"} size={"sm"}>
          <Trans>Edit</Trans>
        </Button>
      )}
      <Dialog
        open={opened}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{positionId ? t`Edit ATC Position ${callsign}` : t`Create ATC Position`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {(eventError ?? slotsError ?? createError ?? updateError) && (
              <Alert variant={"destructive"}>
                <AlertTitle>{(eventError ?? slotsError ?? createError ?? updateError)?.title}</AlertTitle>
                <AlertDescription>{(eventError ?? slotsError ?? createError ?? updateError)?.detail}</AlertDescription>
              </Alert>
            )}
            <form.Field name="callsign">
              {(field) => (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Callsign`}</span>
                  <Input
                    aria-label={t`Callsign`}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase().replace(" ", "_"))}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  />
                </label>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-2">
              <form.Field name="start_at">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Start at`}</span>
                    <DateTimeInput
                      aria-label={t`Start at`}
                      onChange={(e) => field.handleChange(formatISO(e ?? new Date(), { in: utc }))}
                      value={new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </form.Field>
              <form.Field name="end_at">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`End at`}</span>
                    <DateTimeInput
                      aria-label={t`End at`}
                      onChange={(e) => field.handleChange(formatISO(e ?? new Date(), { in: utc }))}
                      value={new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </form.Field>
            </div>
            <form.Field name="position_kind_id">
              {(field) => (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Position`}</span>
                  <NativeSelect
                    aria-label={t`Position`}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    value={field.state.value ?? ""}
                    onChange={(event) => {
                      const e = event.currentTarget.value || null;
                      return e && field.handleChange(e);
                    }}
                  >
                    <NativeSelectOption value=""></NativeSelectOption>
                    {(
                      POSITION_KINDS_MAP.entries()
                        .map(([id, name]) => ({ value: id, label: i18n._(name) }))
                        .toArray() ?? []
                    ).map((option) => {
                      const item = typeof option === "string" ? { value: option, label: option } : option;
                      return (
                        <NativeSelectOption key={item.value} value={item.value}>
                          {item.label}
                        </NativeSelectOption>
                      );
                    })}
                  </NativeSelect>
                </label>
              )}
            </form.Field>
            <form.Field name="minimum_controller_state">
              {(field) => (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Minimum State`}</span>
                  <NativeSelect
                    aria-label={t`Minimum State`}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    value={field.state.value ?? ""}
                    onChange={(event) => {
                      const e = event.currentTarget.value || null;
                      return e && field.handleChange(e as components["schemas"]["UserControllerState"]);
                    }}
                  >
                    <NativeSelectOption value=""></NativeSelectOption>
                    {(
                      POSITION_STATE_MAP.entries()
                        .map(([id, name]) => ({ value: id, label: i18n._(name) }))
                        .toArray() ?? []
                    ).map((option) => {
                      const item = typeof option === "string" ? { value: option, label: option } : option;
                      return (
                        <NativeSelectOption key={item.value} value={item.value}>
                          {item.label}
                        </NativeSelectOption>
                      );
                    })}
                  </NativeSelect>
                </label>
              )}
            </form.Field>
            <form.Field name="remarks">
              {(field) => (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Remark`}</span>
                  <Input
                    aria-label={t`Remark`}
                    onChange={(e) => field.handleChange(e.target.value)}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  />
                </label>
              )}
            </form.Field>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="submit"
                disabled={isCreatePending || isUpdatePending}
                aria-busy={isCreatePending || isUpdatePending}
                variant={"neutral"}
              >
                {eventId ? t`Save` : t`Create`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
