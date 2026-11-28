import { FlightPlan } from "./flight-plan";
import { FlightValidationContext, ValidationResult } from "./validation";
import type { components } from "@/lib/api";
import { Trans } from "@lingui/react/macro";
import type { FC, ReactNode } from "react";

/** Shared plan fields, validation badges and messages for live and temporary plans. */
export const FlightDetails: FC<{
  plan: components["schemas"]["FlightPlanDto"];
  validation: components["schemas"]["FlightValidationDto"];
  temporary?: boolean;
  children?: ReactNode;
}> = ({ plan, validation, temporary = false, children }) => {
  return (
    <FlightValidationContext.Provider value={validation}>
      <div className="flex w-full flex-col gap-2">
        <h2 className="text-2xl font-bold">
          <Trans>Flight Plan</Trans>
        </h2>
        <FlightPlan plan={plan} />
        <h2 className="text-2xl font-bold">
          <Trans>Validation Result</Trans>
        </h2>
        <ValidationResult temporary={temporary} />
        {children}
      </div>
    </FlightValidationContext.Provider>
  );
};
