import { DateTime } from "../event/datetime";
import { utc } from "@date-fns/utc";
import { DateTimePicker, DateTimePickerProps, getTimeRange } from "@mantine/dates";
import { format, formatISO, parse } from "date-fns";
import { FC } from "react";

export const DateTimeInput: FC<DateTimePickerProps> = ({ value, valueFormat, onChange, timePickerProps, ...props }) => {
  const valueUtc = value && parse(format(value, "yyyy-MM-dd HH:mm", { in: utc }), "yyyy-MM-dd HH:mm", new Date());
  const onChangeUtc = (value: string | null) =>
    onChange?.(value && formatISO(parse(value, "yyyy-MM-dd HH:mm:ss", Date.now(), { in: utc })));

  return (
    <div>
      <DateTimePicker
        value={valueUtc}
        valueFormat={valueFormat ?? "YYYY-MM-DD HH:mm[Z]"}
        onChange={onChangeUtc}
        timePickerProps={
          timePickerProps ?? {
            withDropdown: true,
            presets: getTimeRange({ startTime: "00:00", endTime: "23:00", interval: "01:00" }),
          }
        }
        {...props}
      />
      <span className="text-xs">
        <DateTime localFirst>{value}</DateTime>
      </span>
    </div>
  );
};
