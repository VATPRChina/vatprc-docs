import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { errorToast } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Card, Group, Select, TextInput, Textarea } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TbArrowDown, TbArrowUp, TbPlus, TbTrash } from "react-icons/tb";

export const Route = createFileRoute("/sheets/$id")({
  component: RouteComponent,
});

type EditableField = components["schemas"]["SheetFieldSaveRequest"] & {
  localKey: string;
  optionsText: string;
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

function toSaveRequest(name: string, fields: EditableField[]): components["schemas"]["SheetSaveRequest"] {
  return {
    name,
    fields: renumberFields(fields).map((field) => ({
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
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Unknown error";
}

function validateSheet(name: string, fields: EditableField[], t: ReturnType<typeof useLingui>["t"]) {
  if (name.trim().length === 0) return t`Sheet name is required.`;

  for (const [index, field] of fields.entries()) {
    const fieldNumber = index + 1;
    if (field.id.trim().length === 0) return t`Field ${fieldNumber}: ID is required.`;
    if (field.name_zh.trim().length === 0) return t`Field ${fieldNumber}: Chinese name is required.`;
    if (field.kind === "single-choice") {
      const options = field.optionsText
        .split("\n")
        .map((option) => option.trim())
        .filter(Boolean);
      if (options.length === 0) return t`Field ${fieldNumber}: single-choice fields need at least one option.`;
    }
  }

  return null;
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

  const [name, setName] = useState("");
  const [fields, setFields] = useState<EditableField[]>([]);

  useEffect(() => {
    if (!sheet) return;
    setName(sheet.name);
    setFields(toEditableFields(sheet.fields));
  }, [sheet]);

  const onSave = () => {
    if (!id) return;

    const error = validateSheet(name, fields, t);
    if (error) {
      errorToast(new Error(error));
      return;
    }

    saveSheet(
      {
        params: { path: { sheetId: id } },
        body: toSaveRequest(name, fields),
      },
      {
        onSuccess: (updated) => {
          setName(updated.name);
          setFields(toEditableFields(updated.fields));
        },
        onError: (err) => errorToast(new Error(getErrorMessage(err))),
      },
    );
  };

  return (
    <>
      <TextInput
        label={t`Sheet name`}
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        disabled={isSheetLoading}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">
          <Trans>Fields</Trans>
        </h2>
        <Button
          variant="light"
          leftSection={<TbPlus size={16} />}
          onClick={() => setFields((prev) => [...prev, { ...EMPTY_FIELD(), sequence: prev.length }])}
        >
          <Trans>Add field</Trans>
        </Button>
      </div>

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
                    variant="subtle"
                    size="compact-sm"
                    onClick={() =>
                      setFields((prev) => {
                        if (index === 0) return prev;
                        const next = [...prev];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return renumberFields(next);
                      })
                    }
                    disabled={index === 0}
                  >
                    <TbArrowUp size={16} />
                  </Button>
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    onClick={() =>
                      setFields((prev) => {
                        if (index === prev.length - 1) return prev;
                        const next = [...prev];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        return renumberFields(next);
                      })
                    }
                    disabled={index === fields.length - 1}
                  >
                    <TbArrowDown size={16} />
                  </Button>
                  <Button
                    color="red"
                    variant="subtle"
                    size="compact-sm"
                    onClick={() => setFields((prev) => renumberFields(prev.filter((_, i) => i !== index)))}
                  >
                    <TbTrash size={16} />
                  </Button>
                </Group>
              </Group>

              <div className="grid gap-3 md:grid-cols-2">
                <TextInput
                  label={t`Field ID`}
                  value={field.id}
                  onChange={(event) =>
                    setFields((prev) =>
                      prev.map((current, currentIndex) =>
                        currentIndex === index ? { ...current, id: event.currentTarget.value } : current,
                      ),
                    )
                  }
                />
                <Select
                  label={t`Field type`}
                  data={FIELD_KIND_OPTIONS.map((kind) => ({
                    value: kind,
                    label: kind,
                  }))}
                  value={field.kind}
                  allowDeselect={false}
                  onChange={(value) =>
                    setFields((prev) =>
                      prev.map((current, currentIndex) =>
                        currentIndex === index && value
                          ? {
                              ...current,
                              kind: value as components["schemas"]["SheetFieldKind"],
                              optionsText: value === "single-choice" ? current.optionsText : "",
                            }
                          : current,
                      ),
                    )
                  }
                />
                <TextInput
                  label={t`Chinese name`}
                  value={field.name_zh}
                  onChange={(event) =>
                    setFields((prev) =>
                      prev.map((current, currentIndex) =>
                        currentIndex === index ? { ...current, name_zh: event.currentTarget.value } : current,
                      ),
                    )
                  }
                />
                <TextInput
                  label={t`English name`}
                  value={field.name_en ?? ""}
                  onChange={(event) =>
                    setFields((prev) =>
                      prev.map((current, currentIndex) =>
                        currentIndex === index ? { ...current, name_en: event.currentTarget.value } : current,
                      ),
                    )
                  }
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Textarea
                  label={t`Chinese description`}
                  value={field.description_zh ?? ""}
                  onChange={(event) =>
                    setFields((prev) =>
                      prev.map((current, currentIndex) =>
                        currentIndex === index ? { ...current, description_zh: event.currentTarget.value } : current,
                      ),
                    )
                  }
                  autosize
                  minRows={2}
                />
                <Textarea
                  label={t`English description`}
                  value={field.description_en ?? ""}
                  onChange={(event) =>
                    setFields((prev) =>
                      prev.map((current, currentIndex) =>
                        currentIndex === index ? { ...current, description_en: event.currentTarget.value } : current,
                      ),
                    )
                  }
                  autosize
                  minRows={2}
                />
              </div>

              {field.kind === "single-choice" && (
                <Textarea
                  label={t`Options`}
                  description={t`One option per line.`}
                  value={field.optionsText}
                  onChange={(event) =>
                    setFields((prev) =>
                      prev.map((current, currentIndex) =>
                        currentIndex === index
                          ? {
                              ...current,
                              optionsText: event.currentTarget.value,
                            }
                          : current,
                      ),
                    )
                  }
                  autosize
                  minRows={4}
                />
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

      {saveError && <Alert color="red">{saveError.message || t`Failed to save sheet.`}</Alert>}

      <Button onClick={onSave} loading={isSaving} className="self-start">
        <Trans>Save sheet</Trans>
      </Button>
    </>
  );
}
