import { DateTime } from "../event/datetime";
import { DateTimePickerProps } from "./date-input";
import { TextInput } from "./inputs";
import { useLingui } from "@lingui/react/macro";

// The control edits UTC wall time; the API always receives an explicit UTC instant.
export function DateTimeInput({ value, onChange, clearable, ...props }: DateTimePickerProps) {
  const { t } = useLingui();
  const date = value ? new Date(value) : null;
  const display = date && Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 16) : "";
  return (
    <div>
      <TextInput
        {...props}
        rightSection={
          clearable && value ? (
            <button type="button" aria-label={t`Clear date`} onClick={() => onChange?.(null)}>
              ×
            </button>
          ) : undefined
        }
        type="datetime-local"
        value={display}
        onChange={(event) =>
          onChange?.(event.target.value ? new Date(`${event.target.value}:00Z`).toISOString() : null)
        }
      />
      <span className="text-xs">
        <DateTime localFirst>{value}</DateTime>
      </span>
    </div>
  );
}
