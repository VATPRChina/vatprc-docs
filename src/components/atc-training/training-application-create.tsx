import { DateTime } from "../event/datetime";
import { components } from "@/lib/api";
import { $api, useControllerPermissions } from "@/lib/client";
import { promiseWithToast } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Alert, Button, Modal, Text, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { FC } from "react";
import { TbPlus, TbTrash } from "react-icons/tb";

const DEFAULT_VALUES: components["schemas"]["TrainingApplicationCreateRequest"] = {
  name: "",
  slots: [],
};

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

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: ({ value }) => create({ body: value }),
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
          <div className="flex flex-col gap-2">
            <form.Field name="name">
              {(field) => (
                <TextInput
                  label={t`Title`}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join("")}
                  description={t`Briefly describe the target of the training, such as position and lesson content.`}
                />
              )}
            </form.Field>
            <form.Field name="slots" mode="array">
              {(field) => (
                <>
                  <div className="flex flex-row items-center gap-2">
                    <span className="font-bold">
                      <Trans>Slots</Trans>
                    </span>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => {
                        const now = formatISO(new Date(), { in: utc });
                        field.pushValue({ start_at: now, end_at: now });
                      }}
                    >
                      <TbPlus />
                    </ActionIcon>
                  </div>
                  <Alert variant="default">
                    <Trans>
                      A training request may contain multiple slots. Each slot represents a time period when you are
                      available for training. The instructor can then choose any of the provided slots to schedule the
                      training session.
                    </Trans>
                  </Alert>
                  {field.state.meta.errors.length > 0 && (
                    <Alert color="red" title={t`Error`}>
                      <ul>
                        {field.state.meta.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                  {field.state.value.map((_, i) => (
                    <div className="flex flex-row items-start gap-1" key={i}>
                      <form.Field name={`slots[${i}].start_at`}>
                        {(field) => (
                          <div className="flex flex-1 flex-col gap-1">
                            <DateTimePicker
                              label={t`Start at`}
                              onChange={(e) => e && field.handleChange(formatISO(e, { in: utc }))}
                              valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                              value={field.state.value && new Date(field.state.value)}
                              onBlur={field.handleBlur}
                              error={field.state.meta.errors.join("")}
                            />
                            <Text size="xs">
                              <DateTime>{field.state.value}</DateTime>
                            </Text>
                          </div>
                        )}
                      </form.Field>
                      <form.Field name={`slots[${i}].end_at`}>
                        {(field) => (
                          <div className="flex flex-1 flex-col gap-1">
                            <DateTimePicker
                              label={t`End at`}
                              onChange={(e) => e && field.handleChange(formatISO(e, { in: utc }))}
                              valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                              value={field.state.value && new Date(field.state.value)}
                              onBlur={field.handleBlur}
                              error={field.state.meta.errors.join("")}
                            />
                            <Text size="xs">
                              <DateTime>{field.state.value}</DateTime>
                            </Text>
                          </div>
                        )}
                      </form.Field>
                      <ActionIcon variant="subtle" className="self-center" onClick={() => field.removeValue(i)}>
                        <TbTrash />
                      </ActionIcon>
                    </div>
                  ))}
                </>
              )}
            </form.Field>
            <div>
              <Button variant="subtle" type="submit" loading={isCreatePending}>
                <Trans>Create</Trans>
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};
