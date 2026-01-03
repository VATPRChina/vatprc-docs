import { utc } from "@date-fns/utc";
import { useLingui } from "@lingui/react/macro";
import { Tooltip } from "@mantine/core";
import { format, intlFormatDistance } from "date-fns";

export const DateTime = ({
  children,
  noDistance,
  noDate,
}: {
  children?: string | Date | null;
  noDistance?: boolean;
  noDate?: boolean;
}) => {
  const { i18n } = useLingui();
  if (!children) return null;

  const time = typeof children === "string" ? new Date(children) : children;
  return (
    <Tooltip label={format(time, "yyyy-MM-dd HH:mm zzzz")}>
      <span>
        {format(time, noDate ? "HHmm" : "yyyy-MM-dd HH:mm", { in: utc })}
        <span className="text-dimmed text-sm">Z</span>
        {!noDistance && (
          <span className="ml-0.5">
            ({intlFormatDistance(time, Date.now(), { locale: i18n.locale, numeric: "always" })})
          </span>
        )}
      </span>
    </Tooltip>
  );
};
