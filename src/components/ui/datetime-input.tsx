import { DateTime } from "../event/datetime";
import { Input } from "./input";
import { type ComponentProps } from "react";

// Aviation times are entered in UTC regardless of the browser's timezone.
export function DateTimeInput({
  value,
  onChange,
  ...props
}: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value?: string | Date | null;
  onChange?: (value: string | null) => void;
}) {
  const date = value ? new Date(value) : null;
  const formatted = date && Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 16) : "";
  return (
    <div className="grid gap-1">
      <Input
        type="datetime-local"
        value={formatted}
        onChange={(event) =>
          onChange?.(event.currentTarget.value ? new Date(`${event.currentTarget.value}Z`).toISOString() : null)
        }
        {...props}
      />
      <span className="text-xs">
        UTC · <DateTime localFirst>{value}</DateTime>
      </span>
    </div>
  );
}
