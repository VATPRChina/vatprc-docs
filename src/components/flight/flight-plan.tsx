import { CruisingLevelMeters } from "./cruising-level-meters";
import { FlightPlanField } from "./flight-plan-field";
import { Warning } from "./warning";
import { $api } from "@/lib/client";
import { useLingui } from "@lingui/react/macro";
import { createContext, FC } from "react";

export const FlightPlanContext = createContext("");

interface FlightPlanProps {
  callsign: string;
}

export const FlightPlan: FC<FlightPlanProps> = ({ callsign }) => {
  const { t } = useLingui();

  const { data: flight } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}", {
    params: { path: { callsign } },
  });
  const { data: warnings } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}/warnings", {
    params: { path: { callsign } },
  });

  if (!flight) return null;

  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
      <FlightPlanContext.Provider value={callsign}>
        <FlightPlanField field="callsign" label={t`Callsign`} value={flight.callsign} />
        <FlightPlanField field="flight-rules" label={t`Flight Rules`} value={flight.flight_rules} />
        {/* <FlightPlanField label="Date of Flight" value="-" /> */}
        {/* <FlightPlanField label="Voice Rules" value="-" /> */}
        <FlightPlanField field="aircraft-type" label={t`Aircraft Type`} value={flight.aircraft} />
        <FlightPlanField field="wake-category" label={t`Wake Category`} value={flight.wake_category} />
        <FlightPlanField field="equipment" label={t`Equipment`}>
          <div className="flex items-center gap-1">
            {flight.equipment && <span className="text-mono">{flight.equipment}</span>}
            <Warning flight={flight} warnings={warnings} field="equipment" />
          </div>
        </FlightPlanField>
        <FlightPlanField field="transponder" label={t`Transponder`}>
          <div className="flex items-center gap-1">
            {flight.transponder && <span className="text-mono">{flight.transponder}</span>}
            <Warning flight={flight} warnings={warnings} field="transponder" />
          </div>
        </FlightPlanField>
        <FlightPlanField field="departure" label={t`Departure`} value={flight.departure} className="col-start-1" />
        {/* <FlightPlanField label="Off Block" value="-" /> */}
        {/* <FlightPlanField label="Airspeed" value="-" /> */}
        <FlightPlanField field="cruising-level" label={t`Cruising Level`}>
          {flight.cruising_level && (
            <div className="flex items-baseline gap-1">
              <span>{flight.cruising_level} ft</span>
              <CruisingLevelMeters feet={flight.cruising_level} />
            </div>
          )}
          <Warning flight={flight} warnings={warnings} field="cruising-level" />
        </FlightPlanField>
        <FlightPlanField field="route" label={t`Route`} className="md:col-span-2 lg:col-span-4">
          {flight.raw_route && <span className="text-mono">{flight.raw_route}</span>}
          <Warning flight={flight} warnings={warnings} field="route" />
        </FlightPlanField>
        <FlightPlanField field="arrival" label={t`Arrival`} value={flight.arrival} />
        {/* <FlightPlanField label="Enroute Time" value="-" /> */}
        {/* <FlightPlanField label="Alternate" value="-" /> */}
        {/* <FlightPlanField label="Endurance" value="-" /> */}
        <FlightPlanField field="navigation-performance" label={t`PBN`} tooltip={t`Performance Based Navigation`}>
          <div className="flex items-center gap-1">
            {flight.navigation_performance && <span className="text-mono">{flight.navigation_performance}</span>}
            <Warning flight={flight} warnings={warnings} field="navigation-performance" />
          </div>
        </FlightPlanField>
        {/* <FlightPlanField label="CODE" value="-" tooltip="ADSB Hex Code" /> */}
        {/* <FlightPlanField label="RVR" value="-" tooltip="Runway Visual Range Limit" /> */}
        {/* <FlightPlanField label="PER" value="-" tooltip="Performance Code" /> */}
        {/* <FlightPlanField label="SEL" value="-" tooltip="SELCAL Code" /> */}
        {/* <FlightPlanField label="NAV" value="-" tooltip="NAV Equipment" /> */}
        {/* <FlightPlanField label="DAT" value="-" tooltip="Additional Data" /> */}
        {/* <FlightPlanField label="REG" value="-" tooltip="Aircraft Registration" /> */}
        {/* <FlightPlanField label="COM" value="-" tooltip="Communication Codes" /> */}
        {/* <FlightPlanField label="OPR" value="-" tooltip="Operator" /> */}
        {/* <FlightPlanField label="SUR" value="-" tooltip="Surveillance Equipment" /> */}
        {/* <FlightPlanField label="ORGN" value="-" tooltip="Origin of Flightplan" /> */}
        {/* <FlightPlanField label="RALT" value="-" tooltip="Enroute Alternates" /> */}
        {/* <FlightPlanField label="TALT" value="-" tooltip="Takeoff Alternate" /> */}
        {/* <FlightPlanField label="EET" value="-" tooltip="Estimated Elapsed Times" /> */}
        {/* <FlightPlanField label="RMK" value="-" tooltip="Additional Remarks" className="col-span-4" /> */}
      </FlightPlanContext.Provider>
    </div>
  );
};
