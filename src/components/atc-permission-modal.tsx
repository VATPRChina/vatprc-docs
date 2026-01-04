import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { localizeWithMap } from "@/lib/i18n";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Group, Modal, Select, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { endOfDay, format, parse } from "date-fns";
import { ComponentProps, FC, FormEventHandler } from "react";
import { TbDeviceFloppy } from "react-icons/tb";

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
]);

const PositionKindView: FC<{ userId: string; kindId: string; kindName: MessageDescriptor }> = ({
  userId,
  kindId,
  kindName,
}) => {
  const { i18n, t } = useLingui();

  const queryClient = useQueryClient();
  const { data, isPending } = $api.useQuery("get", "/api/users/{id}/atc/permissions", {
    params: { path: { id: userId } },
  });
  const invalidateQueries = () =>
    promiseWithLog(
      queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/users/{id}/atc/permissions", { params: { path: { id: userId } } }),
      ),
    );
  const permission = data?.find((p) => p.position_kind_id === kindId);
  const { mutate: put, isPending: isPutPending } = $api.useMutation("put", "/api/users/{id}/atc/permissions/{kind}", {
    onSuccess: invalidateQueries,
  });
  const { mutate: del, isPending: isDelPending } = $api.useMutation(
    "delete",
    "/api/users/{id}/atc/permissions/{kind}",
    { onSuccess: invalidateQueries },
  );

  const form = useForm({
    defaultValues: {
      state: permission?.state ?? null,
      solo_expires_at: permission?.solo_expires_at ?? null,
    } as {
      state: components["schemas"]["UserControllerState"] | null;
      solo_expires_at: string | null;
    },
    onSubmit: ({ value: { state, solo_expires_at } }) => {
      if (state !== null) {
        put({
          params: { path: { id: userId, kind: kindId } },
          body: { state, solo_expires_at },
        });
      } else {
        del({ params: { path: { id: userId, kind: kindId } } });
      }
    },
  });

  const onSave: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wrapPromiseWithLog(form.handleSubmit());
  };

  return (
    <form onSubmit={onSave}>
      <Group align="end">
        <form.Field name="state">
          {(field) => (
            <Select
              label={i18n._(kindName)}
              data={POSITION_STATE_MAP.entries()
                .map(([id, name]) => ({ value: id, label: i18n._(name) }))
                .toArray()}
              value={field.state.value}
              placeholder={t`No permission`}
              clearable
              className="flex-1"
              onChange={(value) => field.handleChange(value as components["schemas"]["UserControllerState"] | null)}
              onBlur={field.handleBlur}
              disabled={isPending || isPutPending || isDelPending}
              description={t`Current Value: ` + localizeWithMap(POSITION_STATE_MAP, permission?.state ?? "", i18n)}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.values.state}>
          {(value) =>
            value === "solo" && (
              <form.Field name="solo_expires_at">
                {(field) => (
                  <DateInput
                    label={t`Solo Expiration Date`}
                    value={field.state.value && format(field.state.value, "yyyy-MM-dd", { in: utc })}
                    onChange={(v) =>
                      field.handleChange(
                        v !== null
                          ? endOfDay(parse(v, "yyyy-MM-dd", Date.now(), { in: utc }), { in: utc }).toISOString()
                          : null,
                      )
                    }
                    valueFormat="YYYY-MM-DD"
                    clearable
                    className="flex-1"
                    description={t`Current Value: ` + permission?.solo_expires_at}
                    disabled={isPending || isPutPending || isDelPending}
                  />
                )}
              </form.Field>
            )
          }
        </form.Subscribe>
        <ActionIcon variant="subtle" type="submit" size="input-sm" loading={isPutPending || isDelPending}>
          <TbDeviceFloppy />
        </ActionIcon>
      </Group>
    </form>
  );
};

export const AtcPermissionModal: FC<AtcPermissionModalProps> = ({ userId, ...props }) => {
  return (
    <Modal {...props} title={<Trans>Edit ATC permissions</Trans>} size="lg">
      <Stack>
        {POSITION_KINDS_MAP.entries()
          .map(([kindId, kindName]) => (
            <PositionKindView key={kindId} userId={userId} kindId={kindId} kindName={kindName} />
          ))
          .toArray()}
      </Stack>
    </Modal>
  );
};
