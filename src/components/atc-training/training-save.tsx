import { RequireRole } from "../require-role";
import { DateTimeInput } from "../ui/datetime-input";
import { UserInput } from "../user-input";
import { components } from "@/lib/api";
import { $api, usePermission, useUser } from "@/lib/client";
import { promiseWithToast } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { FC } from "react";

export const TrainingSaveModal: FC<{ id?: string; disabled?: boolean }> = ({ id, disabled }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [opened, { toggle, close }] = useDisclosure(false);

  const user = useUser();
  const isSuperAdmin = usePermission("controller-training-director-assistant");

  const { data } = $api.useQuery(
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
  const { mutate: create, isPending: isCreatePending } = $api.useMutation("post", "/api/atc/trainings", {
    onSuccess,
  });
  const { mutate: update, isPending: isUpdatePending } = $api.useMutation("put", "/api/atc/trainings/{id}", {
    onSuccess,
  });

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
        <Button onClick={toggle} variant="outline" disabled={disabled}>
          <Trans>Create Training</Trans>
        </Button>
      )}
      {id && (
        <Button variant="subtle" size="compact-sm" onClick={toggle} disabled={disabled}>
          <Trans>Edit</Trans>
        </Button>
      )}
      <Modal opened={opened} onClose={close} size="xl" title={<Trans>Create Training</Trans>}>
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
            <form.Field name="trainer_id">
              {(field) => (
                <UserInput
                  label={<Trans>Trainer</Trans>}
                  onChange={(v) => v && field.handleChange(v)}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join("")}
                  disabled={!isSuperAdmin}
                />
              )}
            </form.Field>
            <form.Field name="trainee_id">
              {(field) => (
                <UserInput
                  label={<Trans>Trainee</Trans>}
                  onChange={(v) => v && field.handleChange(v)}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join("")}
                />
              )}
            </form.Field>
            <form.Field name="start_at">
              {(field) => (
                <DateTimeInput
                  label={t`Start at`}
                  onChange={(e) => e && field.handleChange(formatISO(e, { in: utc }))}
                  value={field.state.value && new Date(field.state.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join("")}
                />
              )}
            </form.Field>
            <form.Field name="end_at">
              {(field) => (
                <DateTimeInput
                  label={t`End at`}
                  onChange={(e) => e && field.handleChange(formatISO(e, { in: utc }))}
                  value={field.state.value && new Date(field.state.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join("")}
                />
              )}
            </form.Field>
            <div>
              <Button variant="subtle" type="submit" loading={isCreatePending || isUpdatePending}>
                {id ? <Trans>Save</Trans> : <Trans>Create</Trans>}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </RequireRole>
  );
};
