import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog } from "@/lib/helpers";
import { Trans, useLingui } from "@lingui/react/macro";
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
    .map((field, index): EditableField => ({
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
    }));
}

function renumberFields(fields: EditableField[]) {
  return fields.map((field, index) => ({ ...field, sequence: index }));
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
  const {
    data: sheet,
    error: sheetError,
    isLoading: isSheetLoading,
  } = $api.useQuery("get", "/api/sheets/{sheetId}", { params: { path: { sheetId: id ?? "" } } }, { enabled: !!id });
  const { mutate: saveSheet, isPending: isSaving, error: saveError } = $api.useMutation("put", "/api/sheets/{sheetId}");

  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
            onError: () => resolve(),
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
        className="flex flex-col gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          promiseWithLog(form.handleSubmit());
        }}
      >
        {sheetError && (
          <Alert variant={"destructive"}>
            <AlertTitle>{sheetError.title}</AlertTitle>
            <AlertDescription>{sheetError.detail}</AlertDescription>
          </Alert>
        )}
        <form.Field name="name">
          {(field) => (
            <label className="grid gap-1.5 text-sm">
              <span className="font-heading">{t`Sheet name`}</span>
              <Input
                aria-label={t`Sheet name`}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
                disabled={isSheetLoading}
                aria-invalid={!!field.state.meta.errors[0]}
              />
              {field.state.meta.errors[0] && (
                <span role="alert" className="text-xs text-red-600">
                  {field.state.meta.errors[0]}
                </span>
              )}
            </label>
          )}
        </form.Field>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">
            <Trans>Fields</Trans>
          </h2>
          <Button
            type="button"
            onClick={() => {
              const state = form.getFieldValue("fields" as const);
              const currentFields = Array.isArray(state) ? state : [];
              form.setFieldValue("fields" as const, [
                ...currentFields,
                { ...EMPTY_FIELD(), sequence: currentFields.length },
              ]);
            }}
            variant={"neutral"}
          >
            {<TbPlus size={16} />}
            <Trans>Add field</Trans>
          </Button>
        </div>
        <form.Field name="fields" mode="array">
          {(fieldsField) => {
            const fields: EditableField[] = Array.isArray(fieldsField.state.value) ? fieldsField.state.value : [];
            return (
              <div className="flex flex-col gap-2">
                {fields.map((field, index) => {
                  const fieldNumber = index + 1;

                  return (
                    <Card key={field.localKey} className="flex flex-col gap-1">
                      <CardContent>
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-medium">
                            <Trans>Field {fieldNumber}</Trans>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <Button
                              type="button"
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
                              variant={"neutral"}
                              size={"sm"}
                            >
                              <TbArrowUp size={16} />
                            </Button>
                            <Button
                              type="button"
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
                              variant={"neutral"}
                              size={"sm"}
                            >
                              <TbArrowDown size={16} />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                const currentFields = Array.isArray(form.getFieldValue("fields" as const))
                                  ? form.getFieldValue("fields")
                                  : [];
                                form.setFieldValue(
                                  "fields" as const,
                                  renumberFields(currentFields.filter((_, i) => i !== index)),
                                );
                              }}
                              variant={"neutral"}
                              size={"sm"}
                            >
                              <TbTrash size={16} />
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-1 md:grid-cols-2">
                          <form.Field name={`fields[${index}].id`}>
                            {(idField) => (
                              <label className="grid gap-1.5 text-sm">
                                <span className="font-heading">{t`Field ID`}</span>
                                <Input
                                  aria-label={t`Field ID`}
                                  value={idField.state.value ?? ""}
                                  onChange={(event) => idField.handleChange(event.currentTarget.value)}
                                  onBlur={idField.handleBlur}
                                  aria-invalid={!!idField.state.meta.errors[0]}
                                />
                                {idField.state.meta.errors[0] && (
                                  <span role="alert" className="text-xs text-red-600">
                                    {idField.state.meta.errors[0]}
                                  </span>
                                )}
                              </label>
                            )}
                          </form.Field>
                          <form.Field name={`fields[${index}].kind`}>
                            {(kindField) => (
                              <label className="grid gap-1.5 text-sm">
                                <span className="font-heading">{t`Field type`}</span>
                                <NativeSelect
                                  aria-label={t`Field type`}
                                  onBlur={kindField.handleBlur}
                                  value={kindField.state.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.currentTarget.value || null;
                                    if (!value) return;
                                    kindField.handleChange(value as EditableField["kind"]);
                                    if (value !== "single-choice") {
                                      form.setFieldValue(`fields[${index}].optionsText`, "");
                                    }
                                  }}
                                >
                                  <NativeSelectOption value=""></NativeSelectOption>
                                  {(
                                    FIELD_KIND_OPTIONS.map((kind) => ({
                                      value: kind,
                                      label: kind,
                                    })) ?? []
                                  ).map((option) => {
                                    const item = typeof option === "string" ? { value: option, label: option } : option;
                                    return (
                                      <NativeSelectOption key={item.value} value={item.value}>
                                        {item.label}
                                      </NativeSelectOption>
                                    );
                                  })}
                                </NativeSelect>
                              </label>
                            )}
                          </form.Field>
                          <form.Field name={`fields[${index}].name_zh`}>
                            {(nameZhField) => (
                              <label className="grid gap-1.5 text-sm">
                                <span className="font-heading">{t`Chinese name`}</span>
                                <Input
                                  aria-label={t`Chinese name`}
                                  value={nameZhField.state.value ?? ""}
                                  onChange={(event) => nameZhField.handleChange(event.currentTarget.value)}
                                  onBlur={nameZhField.handleBlur}
                                  aria-invalid={!!nameZhField.state.meta.errors[0]}
                                />
                                {nameZhField.state.meta.errors[0] && (
                                  <span role="alert" className="text-xs text-red-600">
                                    {nameZhField.state.meta.errors[0]}
                                  </span>
                                )}
                              </label>
                            )}
                          </form.Field>
                          <form.Field name={`fields[${index}].name_en`}>
                            {(nameEnField) => (
                              <label className="grid gap-1.5 text-sm">
                                <span className="font-heading">{t`English name`}</span>
                                <Input
                                  aria-label={t`English name`}
                                  value={nameEnField.state.value ?? ""}
                                  onChange={(event) => nameEnField.handleChange(event.currentTarget.value)}
                                  onBlur={nameEnField.handleBlur}
                                />
                              </label>
                            )}
                          </form.Field>
                        </div>
                        <div className="grid gap-1 md:grid-cols-2">
                          <form.Field name={`fields[${index}].description_zh`}>
                            {(descZhField) => (
                              <label className="grid gap-1.5 text-sm">
                                <span className="font-heading">{t`Chinese description`}</span>
                                <Textarea
                                  aria-label={t`Chinese description`}
                                  value={descZhField.state.value ?? ""}
                                  onChange={(event) => descZhField.handleChange(event.currentTarget.value)}
                                  onBlur={descZhField.handleBlur}
                                  rows={2}
                                />
                              </label>
                            )}
                          </form.Field>
                          <form.Field name={`fields[${index}].description_en`}>
                            {(descEnField) => (
                              <label className="grid gap-1.5 text-sm">
                                <span className="font-heading">{t`English description`}</span>
                                <Textarea
                                  aria-label={t`English description`}
                                  value={descEnField.state.value ?? ""}
                                  onChange={(event) => descEnField.handleChange(event.currentTarget.value)}
                                  onBlur={descEnField.handleBlur}
                                  rows={2}
                                />
                              </label>
                            )}
                          </form.Field>
                        </div>
                        {field.kind === "single-choice" && (
                          <form.Field name={`fields[${index}].optionsText`}>
                            {(optionsField) => (
                              <label className="grid gap-1.5 text-sm">
                                <span className="font-heading">{t`Options`}</span>
                                <Textarea
                                  aria-label={t`Options`}
                                  value={optionsField.state.value ?? ""}
                                  onChange={(event) => optionsField.handleChange(event.currentTarget.value)}
                                  onBlur={optionsField.handleBlur}
                                  aria-invalid={!!optionsField.state.meta.errors[0]}
                                  rows={4}
                                />
                                <span className="text-foreground/70 text-xs">{t`One option per line.`}</span>
                                {optionsField.state.meta.errors[0] && (
                                  <span role="alert" className="text-xs text-red-600">
                                    {optionsField.state.meta.errors[0]}
                                  </span>
                                )}
                              </label>
                            )}
                          </form.Field>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {fields.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      <Trans>No fields.</Trans>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          }}
        </form.Field>
        {saveError && (
          <Alert variant={"destructive"}>
            <AlertDescription>{saveError.title || t`Failed to save sheet.`}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="self-start" disabled={isSaving} aria-busy={isSaving}>
          <Trans>Save sheet</Trans>
        </Button>
      </form>
    </>
  );
}
