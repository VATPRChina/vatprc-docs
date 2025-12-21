import { $api } from "@/lib/client";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Select, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t, i18n } = useLingui();

  const { navigate } = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = $api.useQuery("get", "/api/users/me");
  const { data: applySheet, error } = $api.useQuery("get", "/api/users/me/atc/applications/sheet");
  const { mutateAsync } = $api.useMutation("post", "/api/users/me/atc/applications");

  const form = useForm({
    defaultValues: Object.fromEntries(
      applySheet?.fields.filter((field) => !field.is_deleted).map((field) => [field.id, ""]) ?? [],
    ),
    onSubmit: ({ value }) =>
      mutateAsync(
        {
          body: {
            request_answers: Object.entries(value).map(([fieldId, answer]) => {
              return {
                id: fieldId,
                answer: answer,
              };
            }),
          },
        },
        {
          onSuccess: wrapPromiseWithLog(async () => {
            await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/applications"));
            notifications.show({
              title: t`Application submitted`,
              message: t`Your ATC application has been submitted successfully.`,
              color: "green",
            });
            await navigate({ to: "/controllers/applications" });
          }),
        },
      ),
  });

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <h1 className="text-2xl">
        <Trans>New ATC Application</Trans>
      </h1>
      <h2 className="text-lg">
        <Trans>Basic Information</Trans>
      </h2>
      <TextInput label={t`CID`} value={user?.cid ?? ""} disabled />
      <TextInput label={t`Full Name`} value={user?.full_name ?? ""} disabled />
      <h2 className="text-lg">
        <Trans>Application Information</Trans>
      </h2>
      {error && <Alert title="Error">{error.message}</Alert>}
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
                return <TextInput {...commonProps} onChange={(e) => field.handleChange(e.target.value)} />;
              } else if (sheetField.kind === "long-text") {
                return (
                  <Textarea
                    {...commonProps}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autosize
                    minRows={4}
                    resize="vertical"
                  />
                );
              } else if (sheetField.kind === "single-choice") {
                return (
                  <Select
                    {...commonProps}
                    data={sheetField.single_choice_options}
                    onChange={(value) => field.handleChange(value ?? "")}
                  />
                );
              }
              return null;
            }}
          </form.Field>
        ))}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}>
          {([canSubmit, isSubmitting, isPristine]) => (
            <Button disabled={!canSubmit || isPristine} loading={isSubmitting} type="submit" className="self-start">
              <Trans>Submit</Trans>
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
