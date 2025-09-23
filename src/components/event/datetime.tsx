import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useLocale } from "@/lib/i18n";
import { utc } from "@date-fns/utc";
import { format, intlFormatDistance } from "date-fns";

export const DateTime = ({
  children,
  noDistance,
  noDate,
}: {
  children?: string | Date;
  noDistance?: boolean;
  noDate?: boolean;
}) => {
  const locale = useLocale();
  if (!children) return null;

  const time = typeof children === "string" ? new Date(children) : children;
  return (
    <Tooltip>
      <TooltipContent>{format(time, "yyyy-MM-dd HH:mm zzzz")}</TooltipContent>
      <TooltipTrigger asChild>
        <span>
          {format(time, noDate ? "HHmm" : "yyyy-MM-dd HH:mm", { in: utc })}
          <span className="text-muted-foreground text-sm">Z</span>
          {!noDistance && (
            <span className="ml-0.5">({intlFormatDistance(time, Date.now(), { locale, numeric: "always" })})</span>
          )}
        </span>
      </TooltipTrigger>
    </Tooltip>
  );
};
