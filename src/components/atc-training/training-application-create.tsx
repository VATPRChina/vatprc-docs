import { DateTimeInput } from "../ui/datetime-input";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { components } from "@/lib/api";
import { $api, useControllerPermissions } from "@/lib/client";
import { promiseWithLog } from "@/lib/helpers";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { useState as useDisclosureState } from "react";
import { FC } from "react";
import { TbPlus, TbTrash } from "react-icons/tb";

const DEFAULT_VALUES: components["schemas"]["TrainingApplicationCreateRequest"] = {
  name: "",
  slots: [],
};

export const TrainingApplicationCreateModal: FC<{ id?: string; disabled?: boolean }> = ({ id, disabled }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [opened, setOpened] = useDisclosureState(false);
  const toggle = () => setOpened((value) => !value);
  const close = () => setOpened(false);

  const { data, error: loadError } = $api.useQuery(
    "get",
    "/api/atc/trainings/applications/{id}",
    { params: { path: { id: id ?? "" } } },
    { enabled: !!id && opened },
  );

  const onSuccess = async () => {
    close();
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/applications"));
    if (id) {
      await queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/atc/trainings/applications/{id}", {
          params: { path: { id } },
        }),
      );
    }
  };
  const {
    mutate: create,
    isPending: isCreatePending,
    error: createError,
  } = $api.useMutation("post", "/api/atc/trainings/applications", { onSuccess });
  const {
    mutate: update,
    isPending: isUpdatePending,
    error: updateError,
  } = $api.useMutation("put", "/api/atc/trainings/applications/{id}", {
    onSuccess,
  });

  const form = useForm({
    defaultValues:
      (data && {
        name: data.name,
        slots: data.slots?.map((slot) => ({ start_at: slot.start_at, end_at: slot.end_at })) ?? [],
      }) ??
      DEFAULT_VALUES,
    onSubmit: ({ value }) => {
      if (!id) return create({ body: value });
      return update({ params: { path: { id } }, body: value });
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {};
        if (!value.name || value.name.trim().length === 0) {
          errors["name"] = t`Title is required`;
        }
        if (!value.slots || value.slots.length === 0) {
          errors["slots"] = t`At least one slot is required`;
        } else {
          value.slots.forEach((slot, index) => {
            if (!slot.start_at) {
              errors[`slots[${index}].start_at`] = t`Start time is required`;
            }
            if (!slot.end_at) {
              errors[`slots[${index}].end_at`] = t`End time is required`;
            }
            if (slot.start_at && slot.end_at && new Date(slot.start_at) >= new Date(slot.end_at)) {
              errors[`slots[${index}].end_at`] = t`End time must be after start time`;
            }
          });
        }
        return { fields: errors };
      },
    },
  });

  const controllerPermissions = useControllerPermissions();
  const hasPermission = controllerPermissions.length > 0;

  return (
    <>
      {hasPermission && !id && (
        <Button onClick={toggle} disabled={disabled} variant={"neutral"}>
          <Trans>Create Training Request</Trans>
        </Button>
      )}
      {hasPermission && id && (
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
            <DialogTitle>{t`Create Training Request`}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              promiseWithLog(form.handleSubmit());
            }}
          >
            <div className="flex flex-col gap-4">
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
              <form.Field name="slots" mode="array">
                {(field) => (
                  <>
                    <div className="flex flex-row items-center gap-1">
                      <span className="font-bold">
                        <Trans>Slots</Trans>
                      </span>
                      <Button
                        onClick={() => {
                          const now = formatISO(new Date(), { in: utc });
                          field.pushValue({ start_at: now, end_at: now });
                        }}
                        size={"icon-sm"}
                        variant={"neutral"}
                      >
                        <TbPlus />
                      </Button>
                    </div>
                    <Alert>
                      <AlertDescription>
                        <Trans>
                          A training request may contain multiple slots. Each slot represents a time period when you are
                          available for training. The instructor can then choose any of the provided slots to schedule
                          the training session.
                        </Trans>
                      </AlertDescription>
                    </Alert>
                    {field.state.meta.errors.length > 0 && (
                      <Alert variant={"destructive"}>
                        <AlertTitle>{t`Error`}</AlertTitle>
                        <AlertDescription>
                          <ul>
                            {field.state.meta.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    {field.state.value.map((_, i) => (
                      <div className="flex flex-row items-start gap-1" key={i}>
                        <form.Field name={`slots[${i}].start_at`}>
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
                        <form.Field name={`slots[${i}].end_at`}>
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
                        <Button
                          className="self-center"
                          onClick={() => field.removeValue(i)}
                          size={"icon-sm"}
                          variant={"neutral"}
                        >
                          <TbTrash />
                        </Button>
                      </div>
                    ))}
                  </>
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
    </>
  );
};
