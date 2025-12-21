import { components } from "@/lib/api";
import { promiseWithLog } from "@/lib/utils";
import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { Skeleton, TextInput, Textarea, Select, Button } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { ComponentProps, FC } from "react";

interface SheetProps extends Omit<ComponentProps<"form">, "onSubmit"> {
  sheet?: components["schemas"]["SheetDto"];
  existingFillingAnswers?: components["schemas"]["AtcApplicationFieldAnswerDto"][];
  onSubmit?: (answers: { id: string; answer: string }[]) => Promise<unknown>;
  isFieldValuesLoading?: boolean;
  isSubmitDisabled?: boolean;
  submitButtonContent?: React.ReactNode;
}

export const Sheet: FC<SheetProps> = ({
  sheet,
  existingFillingAnswers,
  onSubmit,
  isFieldValuesLoading,
  isSubmitDisabled,
  submitButtonContent,
  ...props
}) => {
  const form = useForm({
    defaultValues: Object.fromEntries(
      sheet?.fields
        .filter((field) => !field.is_deleted)
        .map((field) => [field.id, existingFillingAnswers?.find((a) => a.field.id === field.id)?.answer ?? ""]) ?? [],
    ),
    onSubmit: ({ value }) => {
      const answers = Object.entries(value).map(([fieldId, answer]) => {
        return {
          id: fieldId,
          answer: answer,
        };
      });
      return onSubmit?.(answers);
    },
  });

  return (
    <form
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        promiseWithLog(form.handleSubmit());
      }}
    >
      {sheet?.fields.map((sheetField) => (
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
                <Skeleton visible={isFieldValuesLoading}>
                  <TextInput {...commonProps} onChange={(e) => field.handleChange(e.target.value)} />
                </Skeleton>
              );
            } else if (sheetField.kind === "long-text") {
              return (
                <Skeleton visible={isFieldValuesLoading}>
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
                <Skeleton visible={isFieldValuesLoading}>
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
            disabled={!canSubmit || isPristine || isSubmitDisabled}
            loading={isSubmitting}
            type="submit"
            className="self-start"
          >
            {submitButtonContent}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
