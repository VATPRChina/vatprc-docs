import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { utc } from "@date-fns/utc";
import { useLingui } from "@lingui/react/macro";
import { format, intlFormatDistance } from "date-fns";

export const DateTime = ({
  children,
  noDistance,
  noDate,
  localFirst,
}: {
  children?: string | Date | null;
  noDistance?: boolean;
  noDate?: boolean;
  localFirst?: boolean;
}) => {
  const { i18n } = useLingui();
  if (!children) return null;

  const [tooltipFormat, tooltipFormatOptions, textFormat, textFormatOptions] = localFirst
    ? [noDate ? "HHmm'Z'" : "yyyy-MM-dd HH:mm'Z'", { in: utc }, "yyyy-MM-dd HH:mm", {}]
    : ["yyyy-MM-dd HH:mm", {}, noDate ? "HHmm" : "yyyy-MM-dd HH:mm", { in: utc }];

  const time = typeof children === "string" ? new Date(children) : children;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <span>
          <span>{format(time, textFormat, textFormatOptions)}</span>
          <span className="text-dimmed ml-1 text-xs">{localFirst ? format(time, "zzzz") : "Z"}</span>
          {!noDistance && (
            <span className="ml-1">
              ({intlFormatDistance(time, Date.now(), { locale: i18n.locale, numeric: "always" })})
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>{format(time, tooltipFormat, tooltipFormatOptions)}</TooltipContent>
    </Tooltip>
  );
};
