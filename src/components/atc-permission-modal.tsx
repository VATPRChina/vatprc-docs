import { RequireRole } from "./require-role";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog } from "@/lib/helpers";
import { utc } from "@date-fns/utc";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { endOfDay, format, parse } from "date-fns";
import { useState as useDisclosureState } from "react";
import { ComponentProps, FC, FormEventHandler } from "react";
import { TbAirTrafficControl } from "react-icons/tb";

interface AtcPermissionModalProps extends ComponentProps<typeof Dialog> {
  userId: string;
}

export const POSITION_KINDS_MAP: Map<string, MessageDescriptor> = new Map([
  ["DEL", msg`Delivery`],
  ["GND", msg`Ground`],
  ["TWR", msg`Tower`],
  ["T2", msg`Tier 2`],
  ["APP", msg`Approach`],
  ["CTR", msg`Center`],
  ["FSS", msg`Flight Service Station`],
  ["FMP", msg`Flow Management Position`],
]);

export const POSITION_STATE_MAP: Map<components["schemas"]["UserControllerState"], MessageDescriptor> = new Map([
  ["student", msg`Student`],
  ["under-mentor", msg`Under Mentor`],
  ["solo", msg`Solo`],
  ["certified", msg`Certified`],
  ["mentor", msg`Mentor`],
]);

export const AtcPermissionModal: FC<AtcPermissionModalProps> = ({ userId, ...props }) => {
  const { i18n, t } = useLingui();

  const queryClient = useQueryClient();
  const {
    data,
    error: loadError,
    isPending,
  } = $api.useQuery("get", "/api/users/{id}/atc/status", {
    params: { path: { id: userId } },
  });
  const invalidateQueries = () =>
    promiseWithLog(
      Promise.all([
        queryClient.invalidateQueries(
          $api.queryOptions("get", "/api/users/{id}/atc/status", { params: { path: { id: userId } } }),
        ),
        queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/controllers")),
      ]),
    );

  const {
    mutate,
    error: mutationError,
    isPending: isMutating,
  } = $api.useMutation("put", "/api/users/{id}/atc/status", { onSuccess: invalidateQueries });

  const form = useForm({
    defaultValues: {
      is_visiting: data?.is_visiting ?? false,
      is_absent: data?.is_absent ?? false,
      rating: data?.rating ?? "",
      permissions: data?.permissions ?? [],
    },
    onSubmit: ({ value }) => {
      mutate({ params: { path: { id: userId } }, body: value });
    },
  });

  const onSave: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    promiseWithLog(form.handleSubmit());
  };

  return (
    <Dialog {...props}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{<Trans>Edit ATC permissions</Trans>}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave}>
          <div className="flex flex-col gap-4">
            {(loadError ?? mutationError) && (
              <Alert variant={"destructive"}>
                <AlertTitle>{(loadError ?? mutationError)?.title}</AlertTitle>
                <AlertDescription>{(loadError ?? mutationError)?.detail}</AlertDescription>
              </Alert>
            )}
            <form.Field name="is_visiting">
              {(field) => (
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={isPending || isMutating}
                    onCheckedChange={(nextChecked) => {
                      const e = nextChecked;
                      return field.handleChange(e);
                    }}
                  />
                  <span>{t`Visiting`}</span>
                </Label>
              )}
            </form.Field>
            <form.Field name="is_absent">
              {(field) => (
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={isPending || isMutating}
                    onCheckedChange={(nextChecked) => {
                      const e = nextChecked;
                      const isAbsent = e;
                      field.handleChange(isAbsent);

                      if (isAbsent) {
                        form.setFieldValue(
                          "permissions",
                          form.state.values.permissions.map((permission) =>
                            permission.state === "student"
                              ? permission
                              : { ...permission, state: "under-mentor", solo_expires_at: null },
                          ),
                        );
                      }
                    }}
                  />
                  <span>{t`Absent`}</span>
                </Label>
              )}
            </form.Field>
            <form.Field name="rating">
              {(field) => (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Rating`}</span>
                  <NativeSelect
                    aria-label={t`Rating`}
                    onBlur={field.handleBlur}
                    disabled={isPending || isMutating}
                    value={field.state.value ?? ""}
                    onChange={(event) => {
                      const e = event.currentTarget.value || null;
                      return e && field.handleChange(e);
                    }}
                  >
                    <NativeSelectOption value=""></NativeSelectOption>
                    {["OBS", "S1", "S2", "S3", "C1", "C3", "I1", "I3"].map((option) => {
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
            <form.Field name="permissions" mode="array">
              {(parentField) =>
                POSITION_KINDS_MAP.entries()
                  .map(([kindId, kindName]) => (
                    <form.Subscribe
                      key={kindId}
                      selector={(state) => state.values.permissions.findIndex((p) => p.position_kind_id === kindId)}
                    >
                      {(idx) => (
                        <>
                          <form.Field name={`permissions[${idx}].state`}>
                            {(field) => (
                              <label className="grid gap-1.5 text-sm">
                                <span className="font-heading">{i18n._(kindName)}</span>
                                <NativeSelect
                                  aria-label={i18n._(kindName)}
                                  className="flex-1"
                                  onBlur={field.handleBlur}
                                  disabled={isPending || isMutating}
                                  value={(idx >= 0 ? field.state.value : null) ?? ""}
                                  onChange={(event) => {
                                    const value = event.currentTarget.value || null;
                                    if (!value) {
                                      parentField.removeValue(idx);
                                    } else if (idx >= 0) {
                                      field.handleChange(value as components["schemas"]["UserControllerState"]);
                                      if (value !== "solo") {
                                        form.setFieldValue(`permissions[${idx}].solo_expires_at`, null);
                                      }
                                    } else {
                                      parentField.insertValue(idx, {
                                        position_kind_id: kindId,
                                        state: value as components["schemas"]["UserControllerState"],
                                        solo_expires_at: null,
                                      });
                                    }
                                  }}
                                >
                                  <NativeSelectOption value="">{t`No permission`}</NativeSelectOption>
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
                          <form.Subscribe selector={(state) => state.values.permissions[idx]?.state}>
                            {(value) =>
                              value === "solo" && (
                                <form.Field name={`permissions[${idx}].solo_expires_at`}>
                                  {(field) => (
                                    <label className="grid gap-1.5 text-sm">
                                      <span className="font-heading">{t`Solo Expiration Date`}</span>
                                      <Input
                                        aria-label={t`Solo Expiration Date`}
                                        className="flex-1"
                                        disabled={isPending || isMutating}
                                        type={"date"}
                                        value={
                                          (field.state.value && format(field.state.value, "yyyy-MM-dd", { in: utc })) ??
                                          ""
                                        }
                                        onChange={(event) => {
                                          const v = event.currentTarget.value || null;
                                          field.handleChange(
                                            v !== null
                                              ? endOfDay(parse(v, "yyyy-MM-dd", Date.now(), { in: utc }), {
                                                  in: utc,
                                                }).toISOString()
                                              : null,
                                          );
                                        }}
                                      />
                                    </label>
                                  )}
                                </form.Field>
                              )
                            }
                          </form.Subscribe>
                        </>
                      )}
                    </form.Subscribe>
                  ))
                  .toArray()
              }
            </form.Field>
            <Button
              type="submit"
              disabled={isPending || isMutating}
              aria-busy={isPending || isMutating}
              variant={"neutral"}
            >
              <Trans>Save</Trans>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const AtcPermissionModalButton: FC<{ userId: string; iconOnly?: boolean }> = ({ userId, iconOnly = false }) => {
  const { t } = useLingui();
  const [opened, setOpened] = useDisclosureState(false);
  const open = () => setOpened(true);
  const label = t`Edit ATC permissions`;

  return (
    <RequireRole role="controller-training-director-assistant">
      {iconOnly ? (
        <Button onClick={open} aria-label={label} title={label} size={"icon-sm"} variant={"neutral"}>
          <TbAirTrafficControl />
        </Button>
      ) : (
        <Button size="xs" onClick={open} variant={"neutral"}>
          {<TbAirTrafficControl />}
          <Trans>ATC Permission</Trans>
        </Button>
      )}
      {opened && <AtcPermissionModal userId={userId} open={opened} onOpenChange={setOpened} />}
    </RequireRole>
  );
};
