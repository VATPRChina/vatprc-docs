import { InputProps, TextInput } from "./inputs";
import { useLingui } from "@lingui/react/macro";

export interface DateTimePickerProps extends Omit<InputProps, "value" | "onChange"> {
  clearable?: boolean;
  value?: Date | string | null;
  onChange?: (value: string | null) => void;
}
export function DateInput({ value, onChange, clearable, ...props }: DateTimePickerProps) {
  const { t } = useLingui();
  return (
    <TextInput
      {...props}
      rightSection={
        clearable && value ? (
          <button type="button" aria-label={t`Clear date`} onClick={() => onChange?.(null)}>
            ×
          </button>
        ) : undefined
      }
      type="date"
      value={value instanceof Date ? value.toISOString().slice(0, 10) : (value ?? "")}
      onChange={(event) => onChange?.(event.target.value || null)}
    />
  );
}
