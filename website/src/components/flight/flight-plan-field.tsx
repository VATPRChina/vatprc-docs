import { InlineValidationTooltip } from "./validation";
import { components } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Tooltip } from "@mantine/core";
import { ComponentProps } from "react";

interface FlightPlanField extends ComponentProps<"div"> {
  label: string;
  value?: string;
  tooltip?: string;
  field:
    | components["schemas"]["ValidationFieldDto"]
    | Exclude<components["schemas"]["ValidationFieldDto"]["kind"], "leg" | "multiple-legs">;
}

export const FlightPlanField = ({ label, value, tooltip, field, children, className, ...props }: FlightPlanField) => {
  const labelC = tooltip ? (
    <Tooltip label={tooltip}>
      <span className="text-muted-foreground">{label}</span>
    </Tooltip>
  ) : (
    <span className="text-muted-foreground">{label}</span>
  );

  return (
    <div className={cn("flex flex-col items-start gap-1", className)} data-field={field} {...props}>
      <div className="flex flex-wrap items-center gap-1">
        <span>{labelC}</span>
        <InlineValidationTooltip field={typeof field === "string" ? { kind: field } : field} />
      </div>
      {value && value !== "-" && <span className="font-mono">{value}</span>}
      {value === "-" && (
        <Tooltip label={<Trans>Check at VATSIM</Trans>}>
          <span className="text-muted-foreground min-w-8">{value}</span>
        </Tooltip>
      )}
      {children}
    </div>
  );
};
