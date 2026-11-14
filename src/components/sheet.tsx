import { ConfirmButton } from "./ui/confirm-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/lib/api";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/helpers";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { ComponentProps, FC, ReactNode } from "react";

interface SheetProps extends Omit<ComponentProps<"form">, "onSubmit"> {
  sheet?: components["schemas"]["SheetDto"];
  existingFillingAnswers?: components["schemas"]["SheetFieldAnswerDto"][];
  onSubmit?: (answers: { id: string; answer: string }[]) => Promise<unknown>;
  isFieldValuesLoading?: boolean;
  isSubmitDisabled?: boolean;
  isSubmitHidden?: boolean;
  submitButtonContent?: React.ReactNode;
  doNotRequirePristine?: boolean;
  confirm?: ReactNode;
  footer?: ReactNode;
}

export const Sheet: FC<SheetProps> = ({
  sheet,
  existingFillingAnswers,
  onSubmit,
  isFieldValuesLoading,
  isSubmitDisabled,
  isSubmitHidden,
  submitButtonContent,
  doNotRequirePristine,
  confirm,
  footer,
  ...props
}) => {
  const { i18n, t } = useLingui();
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
            const label = i18n.locale === "zh-cn" || !sheetField.name_en ? sheetField.name_zh : sheetField.name_en;
            const description =
              i18n.locale === "zh-cn" || !sheetField.description_en
                ? sheetField.description_zh
                : sheetField.description_en;
            const error = field.state.meta.errors.join("");
            const commonProps = {
              id: field.name,
              name: field.name,
              value: field.state.value ?? "",
              onBlur: field.handleBlur,
              "aria-invalid": !!error,
            };
            if (isFieldValuesLoading) return <Skeleton className="h-16 w-full" />;
            if (isSubmitHidden)
              return (
                <div>
                  <p className="text-sm font-bold">{label}</p>
                  <Card className="mt-1 text-sm">
                    <CardContent>
                      <pre className="font-sans text-wrap">{commonProps.value || <Trans>No content</Trans>}</pre>
                    </CardContent>
                  </Card>
                </div>
              );
            const control =
              sheetField.kind === "short-text" ? (
                <Input {...commonProps} onChange={(e) => field.handleChange(e.target.value)} />
              ) : sheetField.kind === "long-text" ? (
                <Textarea {...commonProps} rows={4} onChange={(e) => field.handleChange(e.target.value)} />
              ) : sheetField.kind === "single-choice" ? (
                <NativeSelect {...commonProps} onChange={(e) => field.handleChange(e.currentTarget.value)}>
                  <NativeSelectOption value="" />
                  {sheetField.single_choice_options.map((option) => (
                    <NativeSelectOption key={option} value={option}>
                      {option}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              ) : null;
            if (control)
              return (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{label}</span>
                  {control}
                  {description && <span className="text-foreground/70 text-xs">{description}</span>}
                  {error && (
                    <span role="alert" className="text-xs text-red-600">
                      {error}
                    </span>
                  )}
                </label>
              );
            return null;
          }}
        </form.Field>
      ))}
      {footer}
      {!isSubmitHidden && (
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}>
          {([canSubmit, isSubmitting, isPristine]) =>
            confirm ? (
              <ConfirmButton
                actionDescription={confirm}
                className="self-start"
                onClick={wrapPromiseWithLog(() => form.handleSubmit())}
                disabled={!canSubmit || (!doNotRequirePristine && isPristine) || isSubmitDisabled || isSubmitting}
                aria-busy={isSubmitting}
              >
                {submitButtonContent}
              </ConfirmButton>
            ) : (
              <Button
                type="submit"
                className="self-start"
                disabled={!canSubmit || (!doNotRequirePristine && isPristine) || isSubmitDisabled || isSubmitting}
                aria-busy={isSubmitting}
              >
                {submitButtonContent}
              </Button>
            )
          }
        </form.Subscribe>
      )}
    </form>
  );
};
