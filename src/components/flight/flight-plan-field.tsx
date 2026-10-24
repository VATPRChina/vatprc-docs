import { RequireRole } from "../require-role";
import { FlightPlanContext } from "./flight-plan";
import { InlineValidations } from "./flight-v2";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Tooltip } from "@mantine/core";
import { ComponentProps, useContext } from "react";

interface FlightPlanField extends ComponentProps<"div"> {
  label: string;
  value?: string;
  tooltip?: string;
  field?: components["schemas"]["WarningMessageField"];
}

export const FlightPlanField = ({ label, value, tooltip, field, children, className, ...props }: FlightPlanField) => {
  const callsign = useContext(FlightPlanContext);
  const { data } = $api.useQuery(
    "get",
    "/api/flights/by-callsign/{callsign}/v2",
    { params: { path: { callsign } } },
    { retry: false },
  );

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
        <RequireRole role="software-engineer">
          <InlineValidations
            results={data?.validations.filter((v) => v.field === field && v.scope.level === "flight") ?? []}
          />
        </RequireRole>
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
