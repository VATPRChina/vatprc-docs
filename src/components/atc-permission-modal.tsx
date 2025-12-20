import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Group, Modal, Select, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useQueryClient } from "@tanstack/react-query";
import { endOfDay, format, parse, parseISO } from "date-fns";
import { ComponentProps, FC, MouseEventHandler, useEffect, useState } from "react";
import { TbDeviceFloppy } from "react-icons/tb";

interface AtcPermissionModalProps extends ComponentProps<typeof Modal> {
  userId: string;
}

const POSITION_KINDS_MAP: Map<string, MessageDescriptor> = new Map([
  ["DEL", msg`Delivery`],
  ["GND", msg`Ground`],
  ["TWR", msg`Tower`],
  ["T2", msg`Tier 2`],
  ["APP", msg`Approach`],
  ["CTR", msg`Center`],
  ["FSS", msg`Flight Service Station`],
  ["FMP", msg`Flow Management Position`],
]);

const POSITION_STATE_MAP: Map<components["schemas"]["UserControllerState"], MessageDescriptor> = new Map([
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

  const [state, setState] = useState<components["schemas"]["UserControllerState"] | null>(permission?.state ?? null);
  const [soloExpiresAt, setSoloExpiresAt] = useState<Date | null>(
    permission?.solo_expires_at ? new Date(permission.solo_expires_at) : null,
  );

  useEffect(() => {
    if (!state) setState(permission?.state ?? null);
    if (!soloExpiresAt) setSoloExpiresAt(permission?.solo_expires_at ? parseISO(permission.solo_expires_at) : null);
  }, [permission]);

  const onSave: MouseEventHandler = () => {
    if (state !== null) {
      put({
        params: { path: { id: userId, kind: kindId } },
        body: {
          state: state,
          solo_expires_at: soloExpiresAt ? soloExpiresAt.toISOString() : null,
        },
      });
    } else {
      del({ params: { path: { id: userId, kind: kindId } } });
    }
  };

  return (
    <Group align="end">
      <Select
        label={i18n._(kindName)}
        data={POSITION_STATE_MAP.entries()
          .map(([id, name]) => ({ value: id, label: i18n._(name) }))
          .toArray()}
        value={state}
        placeholder={t`No permission`}
        clearable
        className="flex-1"
        onChange={(v) => setState(v as components["schemas"]["UserControllerState"] | null)}
        disabled={isPending || isPutPending || isDelPending}
        description={
          t`Current Value: ` +
          i18n._((permission?.state && POSITION_STATE_MAP.get(permission?.state)) ?? msg`No permission`)
        }
      />
      {state === "solo" && (
        <DateInput
          label={t`Solo Expiration Date`}
          value={soloExpiresAt && format(soloExpiresAt, "yyyy-MM-dd", { in: utc })}
          onChange={(e) =>
            setSoloExpiresAt(e !== null ? endOfDay(parse(e, "yyyy-MM-dd", Date.now(), { in: utc }), { in: utc }) : null)
          }
          valueFormat="YYYY-MM-DD"
          clearable
          className="flex-1"
          description={t`Current Value: ` + permission?.solo_expires_at}
          disabled={isPending || isPutPending || isDelPending}
        />
      )}
      <ActionIcon
        variant="subtle"
        size="input-sm"
        onClick={onSave}
        loading={isPutPending || isDelPending}
        disabled={state === "solo" && !soloExpiresAt}
      >
        <TbDeviceFloppy />
      </ActionIcon>
    </Group>
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
