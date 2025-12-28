import { DateTime } from "../event/datetime";
import { components } from "@/lib/api";
import { $api, useControllerPermissions } from "@/lib/client";
import { promiseWithToast } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO, setMinutes, setSeconds } from "date-fns";
import { FC } from "react";

export const TrainingApplicationCreateModal: FC = () => {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [opened, { toggle, close }] = useDisclosure(false);

  const { mutate: create, isPending: isCreatePending } = $api.useMutation("post", "/api/atc/trainings/applications", {
    onSuccess: async () => {
      close();
      await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/applications"));
    },
  });
  const now = formatISO(setMinutes(setSeconds(Date.now(), 0), 0));
  const form = useForm({
    defaultValues: {
      name: "",
      start_at: now,
      end_at: now,
    } satisfies components["schemas"]["TrainingApplicationCreateRequest"],
    onSubmit: ({ value }) => create({ body: value }),
  });

  const controllerPermissions = useControllerPermissions();
  const hasPermission = controllerPermissions.some((p) => p.state === "under-mentor" || p.state === "solo");

  return (
    <>
      {hasPermission && (
        <Button onClick={toggle} variant="outline">
          <Trans>Create Training Request</Trans>
        </Button>
      )}
      <Modal opened={opened} onClose={close} size="xl" title={t`Create Training Request`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            promiseWithToast(form.handleSubmit());
          }}
        >
          <Stack>
            <form.Field name="name">
              {(field) => (
                <TextInput
                  label={t`Title`}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                ></TextInput>
              )}
            </form.Field>
            <Group grow>
              <form.Field name="start_at">
                {(field) => (
                  <Stack gap="xs">
                    <DateTimePicker
                      label={t`Start at`}
                      onChange={(e) => e && field.handleChange(formatISO(e, { in: utc }))}
                      valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                      clearable
                      value={field.state.value && new Date(field.state.value)}
                      onBlur={field.handleBlur}
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
                      onChange={(e) => e && field.handleChange(formatISO(e, { in: utc }))}
                      valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                      clearable
                      value={field.state.value && new Date(field.state.value)}
                      onBlur={field.handleBlur}
                    />
                    <Text size="xs">
                      <DateTime>{field.state.value}</DateTime>
                    </Text>
                  </Stack>
                )}
              </form.Field>
            </Group>
            <Group>
              <Button variant="subtle" type="submit" loading={isCreatePending}>
                <Trans>Create</Trans>
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
