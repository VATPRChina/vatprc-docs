import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { errorToast, promiseWithLog } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Card, Group, Select, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { TbArrowDown, TbArrowUp, TbPlus, TbTrash } from "react-icons/tb";

export const Route = createFileRoute("/sheets/$id")({
  component: RouteComponent,
});

type EditableField = components["schemas"]["SheetFieldSaveRequest"] & {
  localKey: string;
  optionsText: string;
};

type SheetFormData = {
  name: string;
  fields: EditableField[];
};

const FIELD_KIND_OPTIONS: components["schemas"]["SheetFieldKind"][] = ["short-text", "long-text", "single-choice"];

const EMPTY_FIELD = (): EditableField => ({
  localKey: crypto.randomUUID(),
  id: "",
  sequence: 0,
  name_zh: "",
  name_en: "",
  kind: "short-text",
  single_choice_options: [],
  optionsText: "",
  description_zh: "",
  description_en: "",
});

function toEditableFields(fields: components["schemas"]["SheetFieldDto"][]) {
  return fields
    .filter((field) => !field.is_deleted)
    .toSorted((a, b) => a.sequence - b.sequence)
    .map(
      (field, index): EditableField => ({
        localKey: field.id || crypto.randomUUID(),
        id: field.id,
        sequence: index,
        name_zh: field.name_zh,
        name_en: field.name_en ?? "",
        kind: field.kind,
        single_choice_options: field.single_choice_options,
        optionsText: field.single_choice_options.join("\n"),
        description_zh: field.description_zh ?? "",
        description_en: field.description_en ?? "",
      }),
    );
}

function renumberFields(fields: EditableField[]) {
  return fields.map((field, index) => ({ ...field, sequence: index }));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Unknown error";
}

function validateSheet(data: SheetFormData, t: ReturnType<typeof useLingui>["t"]) {
  const errors: Record<string, string> = {};

  if (data.name.trim().length === 0) {
    errors.name = t`Sheet name is required.`;
  }

  const fieldErrors: Record<number, Record<string, string>> = {};

  for (const [index, field] of data.fields.entries()) {
    const currentFieldErrors: Record<string, string> = {};

    if (field.id.trim().length === 0) {
      currentFieldErrors.id = t`ID is required.`;
    }

    if (field.name_zh.trim().length === 0) {
      currentFieldErrors.name_zh = t`Chinese name is required.`;
    }

    if (field.kind === "single-choice") {
      const options = field.optionsText
        .split("\n")
        .map((option) => option.trim())
        .filter(Boolean);
      if (options.length === 0) {
        currentFieldErrors.optionsText = t`Single-choice fields need at least one option.`;
      }
    }

    if (Object.keys(currentFieldErrors).length > 0) {
      fieldErrors[index] = currentFieldErrors;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    errors.fields = t`Please fix errors in the fields.`;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

function RouteComponent() {
  const { id } = Route.useParams();
  const { t } = useLingui();
  const { data: sheet, isLoading: isSheetLoading } = $api.useQuery(
    "get",
    "/api/sheets/{sheetId}",
    { params: { path: { sheetId: id ?? "" } } },
    { enabled: !!id },
  );
  const { mutate: saveSheet, isPending: isSaving, error: saveError } = $api.useMutation("put", "/api/sheets/{sheetId}");

  const form = useForm({
    defaultValues: {
      name: "",
      fields: [],
    } as SheetFormData,
    validators: {
      onChange: ({ value }: { value: SheetFormData }) => {
        return validateSheet(value, t);
      },
    },
    onSubmit: async ({ value }: { value: SheetFormData }) => {
      if (!id) return;

      const saveRequest = {
        name: value.name,
        fields: renumberFields(value.fields).map((field) => ({
          id: field.id.trim(),
          sequence: field.sequence,
          name_zh: field.name_zh.trim(),
          name_en: field.name_en?.trim() || null,
          kind: field.kind,
          single_choice_options:
            field.kind === "single-choice"
              ? field.optionsText
                  .split("\n")
                  .map((option) => option.trim())
                  .filter(Boolean)
              : [],
          description_zh: field.description_zh?.trim() || null,
          description_en: field.description_en?.trim() || null,
        })),
      };

      return new Promise<void>((resolve) => {
        saveSheet(
          {
            params: { path: { sheetId: id } },
            body: saveRequest,
          },
          {
            onSuccess: (updated) => {
              form.setFieldValue("name", updated.name);
              form.setFieldValue("fields", toEditableFields(updated.fields));
              resolve();
            },
            onError: (err) => {
              errorToast(new Error(getErrorMessage(err)));
              resolve();
            },
          },
        );
      });
    },
  });

  useEffect(() => {
    if (!sheet) return;
    form.setFieldValue("name", sheet.name);
    form.setFieldValue("fields", toEditableFields(sheet.fields));
  }, [sheet, form]);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          promiseWithLog(form.handleSubmit());
        }}
      >
        <form.Field name="name">
          {(field) => (
            <TextInput
              label={t`Sheet name`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.currentTarget.value)}
              onBlur={field.handleBlur}
              disabled={isSheetLoading}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">
            <Trans>Fields</Trans>
          </h2>
          <Button
            type="button"
            variant="light"
            leftSection={<TbPlus size={16} />}
            onClick={() => {
              const state = form.getFieldValue("fields" as const);
              const currentFields = Array.isArray(state) ? state : [];
              form.setFieldValue("fields" as const, [
                ...currentFields,
                { ...EMPTY_FIELD(), sequence: currentFields.length },
              ]);
            }}
          >
            <Trans>Add field</Trans>
          </Button>
        </div>

        <form.Field name="fields" mode="array">
          {(fieldsField) => {
            const fields: EditableField[] = Array.isArray(fieldsField.state.value) ? fieldsField.state.value : [];
            return (
              <div className="flex flex-col gap-3">
                {fields.map((field, index) => {
                  const fieldNumber = index + 1;

                  return (
                    <Card key={field.localKey} withBorder className="flex flex-col gap-3">
                      <Group justify="space-between" align="start">
                        <div className="font-medium">
                          <Trans>Field {fieldNumber}</Trans>
                        </div>
                        <Group gap="xs">
                          <Button
                            type="button"
                            variant="subtle"
                            size="compact-sm"
                            onClick={() => {
                              if (index === 0) return;
                              const currentFields = Array.isArray(form.getFieldValue("fields" as const))
                                ? form.getFieldValue("fields")
                                : [];
                              const next = [...currentFields];
                              [next[index - 1], next[index]] = [next[index], next[index - 1]];
                              form.setFieldValue("fields" as const, renumberFields(next));
                            }}
                            disabled={index === 0}
                          >
                            <TbArrowUp size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="subtle"
                            size="compact-sm"
                            onClick={() => {
                              const currentFields = Array.isArray(form.getFieldValue("fields" as const))
                                ? form.getFieldValue("fields")
                                : [];
                              if (index === currentFields.length - 1) return;
                              const next = [...currentFields];
                              [next[index], next[index + 1]] = [next[index + 1], next[index]];
                              form.setFieldValue("fields" as const, renumberFields(next));
                            }}
                            disabled={index === fields.length - 1}
                          >
                            <TbArrowDown size={16} />
                          </Button>
                          <Button
                            type="button"
                            color="red"
                            variant="subtle"
                            size="compact-sm"
                            onClick={() => {
                              const currentFields = Array.isArray(form.getFieldValue("fields" as const))
                                ? form.getFieldValue("fields")
                                : [];
                              form.setFieldValue(
                                "fields" as const,
                                renumberFields(currentFields.filter((_, i) => i !== index)),
                              );
                            }}
                          >
                            <TbTrash size={16} />
                          </Button>
                        </Group>
                      </Group>

                      <div className="grid gap-3 md:grid-cols-2">
                        <form.Field name={`fields[${index}].id`}>
                          {(idField) => (
                            <TextInput
                              label={t`Field ID`}
                              value={idField.state.value ?? ""}
                              onChange={(event) => idField.handleChange(event.currentTarget.value)}
                              onBlur={idField.handleBlur}
                              error={idField.state.meta.errors[0]}
                            />
                          )}
                        </form.Field>
                        <form.Field name={`fields[${index}].kind`}>
                          {(kindField) => (
                            <Select
                              label={t`Field type`}
                              data={FIELD_KIND_OPTIONS.map((kind) => ({
                                value: kind,
                                label: kind,
                              }))}
                              value={kindField.state.value ?? ""}
                              allowDeselect={false}
                              onChange={(value) => {
                                if (!value) return;
                                kindField.handleChange(value as components["schemas"]["SheetFieldKind"]);
                                if (value !== "single-choice") {
                                  form.setFieldValue(`fields[${index}].optionsText`, "");
                                }
                              }}
                              onBlur={kindField.handleBlur}
                            />
                          )}
                        </form.Field>
                        <form.Field name={`fields[${index}].name_zh`}>
                          {(nameZhField) => (
                            <TextInput
                              label={t`Chinese name`}
                              value={nameZhField.state.value ?? ""}
                              onChange={(event) => nameZhField.handleChange(event.currentTarget.value)}
                              onBlur={nameZhField.handleBlur}
                              error={nameZhField.state.meta.errors[0]}
                            />
                          )}
                        </form.Field>
                        <form.Field name={`fields[${index}].name_en`}>
                          {(nameEnField) => (
                            <TextInput
                              label={t`English name`}
                              value={nameEnField.state.value ?? ""}
                              onChange={(event) => nameEnField.handleChange(event.currentTarget.value)}
                              onBlur={nameEnField.handleBlur}
                            />
                          )}
                        </form.Field>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <form.Field name={`fields[${index}].description_zh`}>
                          {(descZhField) => (
                            <Textarea
                              label={t`Chinese description`}
                              value={descZhField.state.value ?? ""}
                              onChange={(event) => descZhField.handleChange(event.currentTarget.value)}
                              onBlur={descZhField.handleBlur}
                              autosize
                              minRows={2}
                            />
                          )}
                        </form.Field>
                        <form.Field name={`fields[${index}].description_en`}>
                          {(descEnField) => (
                            <Textarea
                              label={t`English description`}
                              value={descEnField.state.value ?? ""}
                              onChange={(event) => descEnField.handleChange(event.currentTarget.value)}
                              onBlur={descEnField.handleBlur}
                              autosize
                              minRows={2}
                            />
                          )}
                        </form.Field>
                      </div>

                      {field.kind === "single-choice" && (
                        <form.Field name={`fields[${index}].optionsText`}>
                          {(optionsField) => (
                            <Textarea
                              label={t`Options`}
                              description={t`One option per line.`}
                              value={optionsField.state.value ?? ""}
                              onChange={(event) => optionsField.handleChange(event.currentTarget.value)}
                              onBlur={optionsField.handleBlur}
                              error={optionsField.state.meta.errors[0]}
                              autosize
                              minRows={4}
                            />
                          )}
                        </form.Field>
                      )}
                    </Card>
                  );
                })}

                {fields.length === 0 && (
                  <Alert>
                    <Trans>No fields.</Trans>
                  </Alert>
                )}
              </div>
            );
          }}
        </form.Field>

        {saveError && <Alert color="red">{saveError.message || t`Failed to save sheet.`}</Alert>}

        <Button type="submit" loading={isSaving} className="self-start">
          <Trans>Save sheet</Trans>
        </Button>
      </form>
    </>
  );
}
