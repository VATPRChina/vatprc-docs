import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Checkbox, Modal, Select, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { endOfDay, format, parse } from "date-fns";
import { ComponentProps, FC, FormEventHandler } from "react";

interface AtcPermissionModalProps extends ComponentProps<typeof Modal> {
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
  const { data, isPending } = $api.useQuery("get", "/api/users/{id}/atc/status", {
    params: { path: { id: userId } },
  });
  const invalidateQueries = () =>
    promiseWithLog(
      queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/users/{id}/atc/status", { params: { path: { id: userId } } }),
      ),
    );

  const { mutate, isPending: isMutating } = $api.useMutation("put", "/api/users/{id}/atc/status", {
    onSuccess: invalidateQueries,
  });

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
    wrapPromiseWithLog(form.handleSubmit());
  };

  return (
    <Modal {...props} title={<Trans>Edit ATC permissions</Trans>} size="lg">
      <form onSubmit={onSave}>
        <Stack>
          <form.Field name="is_visiting">
            {(field) => (
              <Checkbox
                label={t`Visiting`}
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                onBlur={field.handleBlur}
                disabled={isPending || isMutating}
              />
            )}
          </form.Field>
          <form.Field name="is_absent">
            {(field) => (
              <Checkbox
                label={t`Absent`}
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                onBlur={field.handleBlur}
                disabled={isPending || isMutating}
              />
            )}
          </form.Field>
          <form.Field name="rating">
            {(field) => (
              <Select
                label={t`Rating`}
                value={field.state.value}
                data={["OBS", "S1", "S2", "S3", "C1", "C3", "I1", "I3"]}
                onChange={(e) => e && field.handleChange(e)}
                onBlur={field.handleBlur}
                disabled={isPending || isMutating}
              />
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
                            <Select
                              label={i18n._(kindName)}
                              data={POSITION_STATE_MAP.entries()
                                .map(([id, name]) => ({ value: id, label: i18n._(name) }))
                                .toArray()}
                              value={idx >= 0 ? field.state.value : null}
                              placeholder={t`No permission`}
                              clearable
                              className="flex-1"
                              onChange={(value) => {
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
                              onBlur={field.handleBlur}
                              disabled={isPending || isMutating}
                            />
                          )}
                        </form.Field>
                        <form.Subscribe selector={(state) => state.values.permissions[idx]?.state}>
                          {(value) =>
                            value === "solo" && (
                              <form.Field name={`permissions[${idx}].solo_expires_at`}>
                                {(field) => (
                                  <DateInput
                                    label={t`Solo Expiration Date`}
                                    value={field.state.value && format(field.state.value, "yyyy-MM-dd", { in: utc })}
                                    onChange={(v) => {
                                      field.handleChange(
                                        v !== null
                                          ? endOfDay(parse(v, "yyyy-MM-dd", Date.now(), { in: utc }), {
                                              in: utc,
                                            }).toISOString()
                                          : null,
                                      );
                                    }}
                                    valueFormat="YYYY-MM-DD"
                                    clearable
                                    className="flex-1"
                                    disabled={isPending || isMutating}
                                  />
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
          <Button variant="subtle" type="submit" loading={isPending || isMutating}>
            <Trans>Save</Trans>
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};
