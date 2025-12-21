import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { wrapPromiseWithLog, promiseWithLog } from "@/lib/utils";
import { useLingui, Trans } from "@lingui/react/macro";
import { TextInput, Alert, Textarea, Select, Button, Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { FC } from "react";

interface AtcApplicationFormProps {
  applicationId?: string;
}

export const AtcApplicationForm: FC<AtcApplicationFormProps> = ({ applicationId }) => {
  const { t, i18n } = useLingui();

  const { navigate } = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading } = $api.useQuery("get", "/api/users/me");
  const {
    data: applySheet,
    error,
    isLoading: isSheetLoading,
  } = $api.useQuery("get", "/api/users/me/atc/applications/sheet");
  const { data: existingApplication, isLoading } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: applicationId ?? "" } },
    enabled: !!applicationId,
  });
  const { mutateAsync: createAsync } = $api.useMutation("post", "/api/users/me/atc/applications");
  const { mutateAsync: updateAsync } = $api.useMutation("put", "/api/users/me/atc/applications/{id}");

  const onCreateSuccess = wrapPromiseWithLog(async () => {
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/applications"));
    notifications.show({
      title: t`Application submitted`,
      message: t`Your ATC application has been submitted successfully.`,
      color: "green",
    });
    await navigate({ to: "/controllers/applications" });
  });
  const onUpdateSuccess = wrapPromiseWithLog(async () => {
    await queryClient.invalidateQueries(
      $api.queryOptions("get", "/api/atc/applications/{id}", { params: { path: { id: applicationId ?? "" } } }),
    );
    notifications.show({
      title: t`Application updated`,
      message: t`Your ATC application has been updated successfully.`,
      color: "green",
    });
  });

  const form = useForm({
    defaultValues: Object.fromEntries(
      applySheet?.fields
        .filter((field) => !field.is_deleted)
        .map((field) => [
          field.id,
          existingApplication?.application_filing_answers?.find((a) => a.field.id === field.id)?.answer ?? "",
        ]) ?? [],
    ),
    onSubmit: ({ value }) => {
      const body = {
        request_answers: Object.entries(value).map(([fieldId, answer]) => {
          return {
            id: fieldId,
            answer: answer,
          };
        }),
      } satisfies components["schemas"]["AtcApplicationRequest"];

      if (applicationId) {
        return updateAsync({ params: { path: { id: applicationId } }, body }, { onSuccess: onUpdateSuccess });
      }
      return createAsync({ body }, { onSuccess: onCreateSuccess });
    },
  });

  const isEditDisabled = !!applicationId && existingApplication?.status !== "submitted";

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg">
        <Trans>Basic Information</Trans>
      </h2>
      <Skeleton visible={isUserLoading}>
        <TextInput label={t`CID`} value={user?.cid ?? ""} disabled />
      </Skeleton>
      <Skeleton visible={isUserLoading}>
        <TextInput label={t`Full Name`} value={user?.full_name ?? ""} disabled />
      </Skeleton>
      <h2 className="text-lg">
        <Trans>Application Information</Trans>
      </h2>
      {error && <Alert title="Error">{error.message}</Alert>}
      {isSheetLoading && <Skeleton h={256} />}
      <form
        className="contents"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          promiseWithLog(form.handleSubmit());
        }}
      >
        {applySheet?.fields.map((sheetField) => (
          <form.Field
            key={sheetField.id}
            name={sheetField.id}
            validators={{
              onChange: ({ value }) => value?.length === 0 && t`The field must not be empty.`,
            }}
          >
            {(field) => {
              const commonProps = {
                id: field.name,
                name: field.name,
                label: i18n.locale === "zh-cn" || !sheetField.name_en ? sheetField.name_zh : sheetField.name_en,
                value: field.state.value ?? "",
                onBlur: field.handleBlur,
                description:
                  i18n.locale === "zh-cn" || !sheetField.description_en
                    ? sheetField.description_zh
                    : sheetField.description_en,
                error: field.state.meta.errors.join(""),
              };
              if (sheetField.kind === "short-text") {
                return (
                  <Skeleton visible={isLoading}>
                    <TextInput {...commonProps} onChange={(e) => field.handleChange(e.target.value)} />
                  </Skeleton>
                );
              } else if (sheetField.kind === "long-text") {
                return (
                  <Skeleton visible={isLoading}>
                    <Textarea
                      {...commonProps}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autosize
                      minRows={4}
                      resize="vertical"
                    />
                  </Skeleton>
                );
              } else if (sheetField.kind === "single-choice") {
                return (
                  <Skeleton visible={isLoading}>
                    <Select
                      {...commonProps}
                      data={sheetField.single_choice_options}
                      onChange={(value) => field.handleChange(value ?? "")}
                    />
                  </Skeleton>
                );
              }
              return null;
            }}
          </form.Field>
        ))}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}>
          {([canSubmit, isSubmitting, isPristine]) => (
            <Button
              disabled={!canSubmit || isPristine || isEditDisabled}
              loading={isSubmitting}
              type="submit"
              className="self-start"
            >
              {!applicationId && <Trans>Submit</Trans>}
              {applicationId && <Trans>Edit</Trans>}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
};
