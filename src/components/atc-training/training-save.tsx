import { RequireRole } from "../require-role";
import { DateTimeInput } from "../ui/datetime-input";
import { ControllerInput } from "../user-input";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { components } from "@/lib/api";
import { $api, usePermission, useUser } from "@/lib/client";
import { promiseWithLog } from "@/lib/helpers";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { useState as useDisclosureState } from "react";
import { FC } from "react";

export const TrainingSaveModal: FC<{ id?: string; disabled?: boolean }> = ({ id, disabled }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [opened, setOpened] = useDisclosureState(false);
  const toggle = () => setOpened((value) => !value);
  const close = () => setOpened(false);

  const user = useUser();
  const isSuperAdmin = usePermission("controller-training-director-assistant");

  const { data, error: loadError } = $api.useQuery(
    "get",
    "/api/atc/trainings/{id}",
    { params: { path: { id: id ?? "" } } },
    { enabled: !!id && opened },
  );

  const onSuccess = async () => {
    close();
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/active"));
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/finished"));
    if (id) {
      await queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/atc/trainings/{id}", { params: { path: { id } } }),
      );
    }
  };
  const {
    mutate: create,
    isPending: isCreatePending,
    error: createError,
  } = $api.useMutation("post", "/api/atc/trainings", { onSuccess });
  const {
    mutate: update,
    isPending: isUpdatePending,
    error: updateError,
  } = $api.useMutation("put", "/api/atc/trainings/{id}", { onSuccess });

  const form = useForm({
    defaultValues: {
      name: data?.name ?? "",
      trainer_id: data?.trainer_id ?? user?.id ?? "",
      trainee_id: data?.trainee_id ?? "",
      start_at: data?.start_at ?? "",
      end_at: data?.end_at ?? "",
    } satisfies components["schemas"]["TrainingSaveRequest"],
    onSubmit: ({ value }) => {
      if (!id) return create({ body: value });
      return update({ params: { path: { id } }, body: value });
    },
  });

  return (
    <RequireRole role="controller-training-mentor">
      {!id && (
        <Button onClick={toggle} disabled={disabled} variant={"neutral"}>
          <Trans>Create Training</Trans>
        </Button>
      )}
      {id && (
        <Button onClick={toggle} disabled={disabled} variant={"neutral"} size={"sm"}>
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
            <DialogTitle>{<Trans>Create Training</Trans>}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              promiseWithLog(form.handleSubmit());
            }}
          >
            <div className="flex flex-col gap-2">
              {(loadError ?? createError ?? updateError) && (
                <Alert variant={"destructive"}>
                  <AlertTitle>{(loadError ?? createError ?? updateError)?.title}</AlertTitle>
                  <AlertDescription>{(loadError ?? createError ?? updateError)?.detail}</AlertDescription>
                </Alert>
              )}
              <form.Field name="name">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Title`}</span>
                    <Input
                      aria-label={t`Title`}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    <span className="text-foreground/70 text-xs">{t`Briefly describe the target of the training, such as position and lesson content.`}</span>
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name="trainer_id">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{<Trans>Trainer</Trans>}</span>
                    <ControllerInput
                      onChange={(v) => v && field.handleChange(v)}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      disabled={!isSuperAdmin}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name="trainee_id">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{<Trans>Trainee</Trans>}</span>
                    <ControllerInput
                      onChange={(v) => v && field.handleChange(v)}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name="start_at">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Start at`}</span>
                    <DateTimeInput
                      aria-label={t`Start at`}
                      onChange={(e) => e && field.handleChange(formatISO(e, { in: utc }))}
                      value={field.state.value && new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name="end_at">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`End at`}</span>
                    <DateTimeInput
                      aria-label={t`End at`}
                      onChange={(e) => e && field.handleChange(formatISO(e, { in: utc }))}
                      value={field.state.value && new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <div>
                <Button
                  type="submit"
                  disabled={isCreatePending || isUpdatePending}
                  aria-busy={isCreatePending || isUpdatePending}
                  variant={"neutral"}
                >
                  {id ? <Trans>Save</Trans> : <Trans>Create</Trans>}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </RequireRole>
  );
};
