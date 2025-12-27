import { POSITION_KINDS_MAP, POSITION_STATE_MAP } from "../atc-permission-modal";
import { DateTime } from "./datetime";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog, promiseWithToast } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Group, Modal, Select, Stack, Text, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO, setMinutes, setSeconds } from "date-fns";
import { FormEvent } from "react";

export const CreateAtcSlot = ({ eventId, positionId }: { eventId: string; positionId?: string }) => {
  const { t, i18n } = useLingui();
  const [opened, { toggle, close }] = useDisclosure(false);

  const queryClient = useQueryClient();
  const { data: event, isLoading } = $api.useQuery(
    "get",
    "/api/events/{eid}",
    { params: { path: { eid: eventId ?? "0" } } },
    { enabled: opened },
  );
  const { data: slots } = $api.useQuery("get", "/api/events/{eventId}/controllers", {
    params: { path: { eventId } },
  });
  const slot = slots?.find((s) => s.id === positionId);
  const callsign = slot?.callsign;

  const onSuccess = () => {
    close();
    promiseWithLog(
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions("get", "/api/events/{eventId}/controllers", { params: { path: { eventId } } })
          .queryKey,
      }),
    );
  };
  const { mutate: create, isPending: isCreatePending } = $api.useMutation("post", "/api/events/{eventId}/controllers", {
    onSuccess,
  });
  const { mutate: update, isPending: isUpdatePending } = $api.useMutation(
    "put",
    "/api/events/{eventId}/controllers/{positionId}",
    { onSuccess },
  );
  const now = formatISO(setMinutes(setSeconds(Date.now(), 0), 0));
  const form = useForm({
    defaultValues: {
      callsign: slot?.callsign ?? "",
      start_at: slot?.start_at ?? event?.start_at ?? now,
      end_at: slot?.end_at ?? event?.end_at ?? now,
      position_kind_id: slot?.position_kind_id ?? "DEL",
      minimum_controller_state:
        slot?.minimum_controller_state ?? ("student" as components["schemas"]["UserControllerState"]),
      remarks: slot?.remarks ?? "",
    } satisfies components["schemas"]["EventAtcPositionSaveRequest"],
    onSubmit: ({ value }) => {
      if (positionId) {
        update({ params: { path: { eventId, positionId } }, body: value });
      } else {
        create({ params: { path: { eventId } }, body: value });
      }
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    promiseWithToast(form.handleSubmit());
  };

  return (
    <>
      {!positionId ? (
        <Button variant="subtle" onClick={toggle}>
          <Trans>Create ATC Position</Trans>
        </Button>
      ) : (
        <Button variant="subtle" onClick={toggle}>
          <Trans>Edit</Trans>
        </Button>
      )}
      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        title={positionId ? t`Edit ATC Position ${callsign}` : t`Create ATC Position`}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <form.Field name="callsign">
            {(field) => (
              <TextInput
                label={t`Callsign`}
                onChange={(e) => field.handleChange(e.target.value.toUpperCase().replace(" ", "_"))}
                value={field.state.value}
                onBlur={field.handleBlur}
                disabled={isLoading}
              />
            )}
          </form.Field>
          <Group grow>
            <form.Field name="start_at">
              {(field) => (
                <Stack gap="xs">
                  <DateTimePicker
                    label={t`Start at`}
                    onChange={(e) => field.handleChange(formatISO(e ?? new Date(), { in: utc }))}
                    valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                    value={new Date(field.state.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  />
                  <Text size="xs">
                    <DateTime>{field.state.value}</DateTime>
                  </Text>
                </Stack>
              )}
            </form.Field>
            <form.Field name="end_at">
              {(field) => (
                <Stack gap="xs">
                  <DateTimePicker
                    label={t`End at`}
                    onChange={(e) => field.handleChange(formatISO(e ?? new Date(), { in: utc }))}
                    valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                    value={new Date(field.state.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  />
                  <Text size="xs">
                    <DateTime>{field.state.value}</DateTime>
                  </Text>
                </Stack>
              )}
            </form.Field>
          </Group>
          <form.Field name="position_kind_id">
            {(field) => (
              <Select
                label={t`Position`}
                onChange={(e) => e && field.handleChange(e)}
                value={field.state.value}
                onBlur={field.handleBlur}
                disabled={isLoading}
                data={POSITION_KINDS_MAP.entries()
                  .map(([id, name]) => ({ value: id, label: i18n._(name) }))
                  .toArray()}
              />
            )}
          </form.Field>
          <form.Field name="minimum_controller_state">
            {(field) => (
              <Select
                label={t`Minimum State`}
                onChange={(e) => e && field.handleChange(e as components["schemas"]["UserControllerState"])}
                value={field.state.value}
                onBlur={field.handleBlur}
                disabled={isLoading}
                data={POSITION_STATE_MAP.entries()
                  .map(([id, name]) => ({ value: id, label: i18n._(name) }))
                  .toArray()}
              />
            )}
          </form.Field>
          <form.Field name="remarks">
            {(field) => (
              <TextInput
                label={t`Remark`}
                onChange={(e) => field.handleChange(e.target.value)}
                value={field.state.value}
                onBlur={field.handleBlur}
                disabled={isLoading}
              ></TextInput>
            )}
          </form.Field>
          <Group>
            <Button variant="subtle" type="submit" loading={isCreatePending || isUpdatePending}>
              {eventId ? t`Save` : t`Create`}
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
};
