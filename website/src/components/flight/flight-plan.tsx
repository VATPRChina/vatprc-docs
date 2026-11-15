import { CruisingLevelMeters } from "./cruising-level-meters";
import { FlightPlanField } from "./flight-plan-field";
import type { components } from "@/lib/api";
import { useLingui } from "@lingui/react/macro";
import { type FC } from "react";

export const FlightPlan: FC<{ plan: components["schemas"]["FlightPlanDto"] }> = ({ plan }) => {
  const { t } = useLingui();

  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
      <FlightPlanField field="callsign" label={t`Callsign`} value={plan.callsign} />
      <FlightPlanField field="flight-rules" label={t`Flight Rules`} value={plan.flight_rules} />
      <FlightPlanField field="aircraft-type" label={t`Aircraft Type`} value={plan.aircraft} />
      <FlightPlanField field="wake-category" label={t`Wake Category`} value={plan.wake_category} />
      <FlightPlanField field="equipment" label={t`Equipment`} value={plan.equipment} />
      <FlightPlanField field="transponder" label={t`Transponder`} value={plan.transponder} />
      <FlightPlanField field="departure" label={t`Departure`} value={plan.departure} className="col-start-1" />
      <FlightPlanField field="cruising-level" label={t`Cruising Level`}>
        {plan.cruising_level > 0 && (
          <div className="flex items-baseline gap-1">
            <span>{plan.cruising_level} ft</span>
            <CruisingLevelMeters feet={plan.cruising_level} />
          </div>
        )}
      </FlightPlanField>
      <FlightPlanField field="route" label={t`Route`} value={plan.raw_route} className="md:col-span-2 lg:col-span-4" />
      <FlightPlanField field="arrival" label={t`Arrival`} value={plan.arrival} />
      <FlightPlanField
        field="navigation-performance"
        label={t`PBN`}
        value={plan.navigation_performance}
        tooltip={t`Performance Based Navigation`}
      />
    </div>
  );
};
