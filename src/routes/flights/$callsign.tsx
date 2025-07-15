import { FlightWarnings } from "@/components/flight-warnings";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/button-link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { getLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TbArrowLeft, TbInfoCircleFilled, TbPlaneInflight } from "react-icons/tb";

export const Route = createFileRoute("/flights/$callsign")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ name: "robots", content: "noindex" }, { title: `${ctx.params.callsign} - Flight Plan` }],
  }),
});

const EditFpl = () => (
  <a
    href="https://my.vatsim.net/pilots/flightplan/"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-primary/80 underline"
  >
    <Trans>Edit your flight plan on VATSIM.</Trans>
  </a>
);

interface FplFieldProps {
  label: string;
  value?: string;
  tooltip?: string;
}
const FplField = ({
  label,
  value,
  tooltip,
  children,
  className,
  ...props
}: FplFieldProps & React.ComponentProps<"div">) => {
  const labelC = tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-muted-foreground">{label}</span>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    <span className="text-muted-foreground">{label}</span>
  );

  return (
    <div className={cn("flex flex-col items-start gap-2", className)} {...props}>
      {labelC}
      {value && value !== "-" && <span className="font-mono">{value}</span>}
      {value === "-" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground min-w-8">{value}</span>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Check at VATSIM</p>
          </TooltipContent>
        </Tooltip>
      )}
      {children}
    </div>
  );
};

const AIRCRAFT_CODES_HELP_LINK = `https://community.vatprc.net/t/topic/${getLocale() == "en" ? 9700 : 9695}`;
const AircraftCodeCommonHelp = ({ type }: { type: "PBN" | "Equip+T" }) => (
  <>
    <p>
      <img
        src={
          type === "PBN"
            ? "https://cdn.sa.net/2025/07/19/icdkAQVeoNrablP.png"
            : "https://cdn.sa.net/2025/07/19/JnkshOqN6fr4BzW.png"
        }
        className="w-[960px] max-w-screen"
      />
    </p>
    <p className="hover:text-primary/80 underline">
      <a href={AIRCRAFT_CODES_HELP_LINK} target="_blank" rel="noopener noreferrer">
        Learn more
      </a>
    </p>
  </>
);

const ChinaRvsmHelp = () => (
  <>
    <p className="hover:text-primary/80 underline">
      <Link to="/airspace/rvsm">Learn more about China RVSM</Link>
    </p>
  </>
);

const CRUISING_LEVEL_TEXT: Record<string, string> = {
  standard_even: "China RVSM even flight level",
  standard_odd: "China RVSM odd flight level",
  standard: "China RVSM flight level",
  flight_level_even: "even flight level",
  flight_level_odd: "odd flight level",
  flight_level: "flight level",
};

const WARNING_MESSAGE_TO_SEVERITY: Record<components["schemas"]["WarningMessageCode"], "error" | "warning"> = {
  no_rvsm: "error",
  no_rnav1: "error",
  rnp_ar: "warning",
  rnp_ar_without_rf: "warning",
  no_transponder: "error",
  route_direct_segment: "error",
  route_leg_direction: "error",
  airway_require_approval: "error",
  not_preferred_route: "error",
  cruising_level_mismatch: "error",
  cruising_level_too_low: "error",
  cruising_level_not_allowed: "error",
  route_match_preferred: "warning",
};

const WARNING_CODE_TO_MESSAGE: Record<components["schemas"]["WarningMessageCode"], string> = {
  no_rvsm: "No RVSM",
  no_rnav1: "No RNAV1",
  rnp_ar: "RNP AR",
  rnp_ar_without_rf: "RNP AR without RF",
  no_transponder: "No transponder",
  route_direct_segment: "Direct leg",
  route_leg_direction: "Leg direction violation",
  airway_require_approval: "Restricted airway",
  not_preferred_route: "Not preferred route",
  cruising_level_mismatch: "Cruising Level Type Mismatch",
  cruising_level_too_low: "Cruising Level Too Low",
  cruising_level_not_allowed: "Cruising Level Not Allowed",
  route_match_preferred: "Match preferred route",
};
const WARNING_MESSAGE_TO_POPOVER: Record<
  components["schemas"]["WarningMessageCode"],
  React.FC<{ warning: components["schemas"]["WarningMessage"]; flight: components["schemas"]["FlightDto"] }>
> = {
  no_rvsm: () => (
    <>
      <p>The aircraft does not specify RVSM capability.</p>
      <p>
        <EditFpl />
        Add
        <span className="text-mono">W</span>
        to equipment code.
      </p>
      <AircraftCodeCommonHelp type="Equip+T" />
    </>
  ),
  no_rnav1: ({ warning }) => (
    <>
      <p>The aircraft does not specify RNAV1 capability.</p>
      <p>
        <EditFpl />
        {warning.field === "equipment" && (
          <>
            Add
            <span className="text-mono">R</span>
            to equipment code.
          </>
        )}
        {warning.field === "navigation_performance" && (
          <>
            Add
            <span className="text-mono">D1</span>
            or
            <span className="text-mono">D2</span>
            to PBN.
          </>
        )}
      </p>
      <AircraftCodeCommonHelp type="PBN" />
    </>
  ),
  rnp_ar: () => null,
  rnp_ar_without_rf: () => null,
  no_transponder: () => (
    <>
      <p>Transponder field is empty.</p>
      <p>
        <EditFpl />
        Write your transponder equipment code.
      </p>
      <AircraftCodeCommonHelp type="Equip+T" />
    </>
  ),
  route_direct_segment: () => null,
  route_leg_direction: () => null,
  airway_require_approval: () => null,
  not_preferred_route: () => null,
  cruising_level_mismatch: ({ warning }) => (
    <>
      <p>
        The cruising level type does not meet the requirement of the route. Cruising level should be
        {CRUISING_LEVEL_TEXT[warning.parameter ?? "Contact ATC"]}.
      </p>
      <p>
        <EditFpl />
        Pick a suitable cruising level.
      </p>
      <ChinaRvsmHelp />
    </>
  ),
  cruising_level_too_low: ({ warning }) => (
    <>
      <p>
        The cruising level is too low for route. The minimum is
        {warning.parameter}
        feet.
      </p>
      <p>
        <EditFpl />
        Pick a suitable cruising level.
      </p>
    </>
  ),
  cruising_level_not_allowed: ({ warning }) => (
    <>
      <p>The cruising level is not allowed for the route.</p>
      <p>
        Allowed levels are
        {warning.parameter}
        (in feet).
      </p>
      <p>
        <EditFpl />
        Pick a suitable cruising level.
      </p>
      <ChinaRvsmHelp />
    </>
  ),
  route_match_preferred: () => null,
};

interface WarningProps {
  field: components["schemas"]["WarningMessageField"];
  field_index?: number;
  warnings?: components["schemas"]["WarningMessage"][];
  flight: components["schemas"]["FlightDto"];
}
const Warning = ({
  field,
  field_index,
  warnings,
  flight,
  ...props
}: WarningProps & React.ComponentProps<typeof Popover>) => {
  if (!warnings) return null;

  const localWarnings = warnings.filter((w) => w.field === field && w.field_index === (field_index ?? null));

  return (
    <div className="flex items-center gap-2">
      {localWarnings.map((warning) => {
        const button = (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              (WARNING_MESSAGE_TO_SEVERITY[warning.message_code] ?? "error") === "error" &&
                "text-destructive hover:text-destructive",
            )}
            key={warning.message_code}
          >
            <TbInfoCircleFilled />
            {WARNING_CODE_TO_MESSAGE[warning.message_code] ?? warning.message_code}
          </Button>
        );

        const content = WARNING_MESSAGE_TO_POPOVER[warning.message_code]?.({ warning, flight }) as React.ReactNode;

        if (!content) return button;

        return (
          <Popover {...props} key={warning.message_code}>
            <PopoverTrigger asChild>{button}</PopoverTrigger>
            <PopoverContent className="w-max">{content}</PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
};

function RouteComponent() {
  const { callsign } = Route.useParams();

  const {
    error,
    data: flight,
    isLoading,
  } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}", { params: { path: { callsign } } });
  const { data: warnings } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}/warnings", {
    params: { path: { callsign } },
  });
  const { data: route } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}/route", {
    params: { path: { callsign } },
  });

  return (
    <div className="flex flex-col items-start gap-4">
      <LinkButton variant="ghost" to="..">
        <TbArrowLeft />
        Back
      </LinkButton>
      {error?.message && (
        <Alert color="red">
          <AlertTitle>{error?.message}</AlertTitle>
        </Alert>
      )}
      {isLoading && <Skeleton className="h-48 w-full" />}
      {!error && flight && (
        <div className="flex w-full flex-col gap-4">
          <h1 className="flex items-baseline">
            <span className="text-3xl">{callsign}</span>
            <span className="text-muted-foreground ml-2 flex gap-1 text-2xl">
              <span>{flight.departure}</span>
              <TbPlaneInflight />
              <span>{flight.arrival}</span>
            </span>
          </h1>
          <h2 className="text-2xl">Flight Plan</h2>
          <div className="grid grid-cols-4 gap-4">
            <FplField label="Callsign" value={flight.callsign} />
            {/* <FplField label="Flight Rules" value="-" /> */}
            {/* <FplField label="Date of Flight" value="-" /> */}
            {/* <FplField label="Voice Rules" value="-" /> */}
            {/* <FplField label="Aircraft Type" value="-" /> */}
            {/* <FplField label="Wake Category" value="-" /> */}
            <FplField label="Equipment">
              <div className="flex items-center gap-2">
                {flight.equipment && <span className="text-mono">{flight.equipment}</span>}
                <Warning flight={flight} warnings={warnings} field="equipment" />
              </div>
            </FplField>
            <FplField label="Transponder">
              <div className="flex items-center gap-2">
                {flight.transponder && <span className="text-mono">{flight.transponder}</span>}
                <Warning flight={flight} warnings={warnings} field="transponder" />
              </div>
            </FplField>
            <FplField label="Departure" value={flight.departure} className="col-start-1" />
            {/* <FplField label="Off Block" value="-" /> */}
            {/* <FplField label="Airspeed" value="-" /> */}
            <FplField label="Cruising Level (Feet)">
              {flight.cruising_level && <span className="text-mono">{flight.cruising_level}</span>}
              <Warning flight={flight} warnings={warnings} field="cruising_level" />
            </FplField>
            <FplField label="Route" className="col-span-4">
              {flight.raw_route && <span className="text-mono">{flight.raw_route}</span>}
              <Warning flight={flight} warnings={warnings} field="route" />
            </FplField>
            <FplField label="Arrival" value={flight.arrival} />
            {/* <FplField label="Enroute Time" value="-" /> */}
            {/* <FplField label="Alternate" value="-" /> */}
            {/* <FplField label="Endurance" value="-" /> */}
            <FplField label="PBN" tooltip="Performance Based Navigation">
              <div className="flex items-center gap-2">
                {flight.navigation_performance && <span className="text-mono">{flight.navigation_performance}</span>}
                <Warning flight={flight} warnings={warnings} field="navigation_performance" />
              </div>
            </FplField>
            {/* <FplField label="CODE" value="-" tooltip="ADSB Hex Code" /> */}
            {/* <FplField label="RVR" value="-" tooltip="Runway Visual Range Limit" /> */}
            {/* <FplField label="PER" value="-" tooltip="Performance Code" /> */}
            {/* <FplField label="SEL" value="-" tooltip="SELCAL Code" /> */}
            {/* <FplField label="NAV" value="-" tooltip="NAV Equipment" /> */}
            {/* <FplField label="DAT" value="-" tooltip="Additional Data" /> */}
            {/* <FplField label="REG" value="-" tooltip="Aircraft Registration" /> */}
            {/* <FplField label="COM" value="-" tooltip="Communication Codes" /> */}
            {/* <FplField label="OPR" value="-" tooltip="Operator" /> */}
            {/* <FplField label="SUR" value="-" tooltip="Surveillance Equipment" /> */}
            {/* <FplField label="ORGN" value="-" tooltip="Origin of Flightplan" /> */}
            {/* <FplField label="RALT" value="-" tooltip="Enroute Alternates" /> */}
            {/* <FplField label="TALT" value="-" tooltip="Takeoff Alternate" /> */}
            {/* <FplField label="EET" value="-" tooltip="Estimated Elapsed Times" /> */}
            {/* <FplField label="RMK" value="-" tooltip="Additional Remarks" className="col-span-4" /> */}
          </div>
          <h2 className="text-2xl">Validation Result</h2>
          <FlightWarnings callsign={callsign} />
          <h2 className="text-2xl">Flight Route</h2>
          <div className="grid grid-cols-[auto_auto_auto_1fr] gap-x-4 gap-y-1">
            <div className="contents">
              <span className="text-muted-foreground col-1 text-right font-light">From</span>
              <span className="text-muted-foreground col-2 text-center font-light">Via</span>
              <span className="text-muted-foreground col-3 text-left font-light">To</span>
            </div>
            {route &&
              route.map((r, i) => (
                <div key={`${r.from.identifier}-${r.leg_identifier}-${r.to.identifier}`} className="contents">
                  <span className="col-1 text-right font-mono">{r.from.identifier}</span>
                  <span className="col-2 text-center font-mono">{r.leg_identifier}</span>
                  <span className="col-3 text-left font-mono">{r.to.identifier}</span>
                  <div className="text-destructive min-h-8 self-baseline text-sm">
                    <Warning flight={flight} warnings={warnings} field="route" field_index={i} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
