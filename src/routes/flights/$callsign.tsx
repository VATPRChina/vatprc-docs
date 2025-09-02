import { FlightWarnings } from "@/components/flight-warnings";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/button-link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TbArrowLeft, TbInfoCircleFilled, TbPlaneInflight } from "react-icons/tb";

export const Route = createFileRoute("/flights/$callsign")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ name: "robots", content: "noindex" }, { title: ctx.params.callsign }],
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
            <p>
              <Trans>Check at VATSIM</Trans>
            </p>
          </TooltipContent>
        </Tooltip>
      )}
      {children}
    </div>
  );
};

const AircraftCodeCommonHelp = ({ type }: { type: "PBN" | "Equip+T" }) => {
  const locale = useLocale();
  const AIRCRAFT_CODES_HELP_LINK = `https://community.vatprc.net/t/topic/${locale == "en" ? 9700 : 9695}`;
  return (
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
          <Trans>Learn more</Trans>
        </a>
      </p>
    </>
  );
};

const ChinaRvsmHelp = () => (
  <>
    <p className="hover:text-primary/80 underline">
      <Link to="/airspace/rvsm">
        <Trans>Learn more about China RVSM</Trans>
      </Link>
    </p>
  </>
);

const CRUISING_LEVEL_TEXT: Record<string, React.ReactNode> = {
  standard_even: <Trans>China RVSM even flight level</Trans>,
  standard_odd: <Trans>China RVSM odd flight level</Trans>,
  standard: <Trans>China RVSM flight level</Trans>,
  flight_level_even: <Trans context="feet">even flight level</Trans>,
  flight_level_odd: <Trans context="feet">odd flight level</Trans>,
  flight_level: <Trans context="feet">flight level</Trans>,
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

const WARNING_CODE_TO_MESSAGE: Record<components["schemas"]["WarningMessageCode"], React.ReactNode> = {
  no_rvsm: <Trans>No RVSM</Trans>,
  no_rnav1: <Trans>No RNAV1</Trans>,
  rnp_ar: <Trans>RNP AR</Trans>,
  rnp_ar_without_rf: <Trans>RNP AR without RF</Trans>,
  no_transponder: <Trans>No transponder</Trans>,
  route_direct_segment: <Trans>Direct leg</Trans>,
  route_leg_direction: <Trans>Leg direction violation</Trans>,
  airway_require_approval: <Trans>Restricted airway</Trans>,
  not_preferred_route: <Trans>Not designated route</Trans>,
  cruising_level_mismatch: <Trans>Cruising Level Type Mismatch</Trans>,
  cruising_level_too_low: <Trans>Cruising Level Too Low</Trans>,
  cruising_level_not_allowed: <Trans>Cruising Level Not Allowed</Trans>,
  route_match_preferred: <Trans>Match designated route</Trans>,
};
const WARNING_MESSAGE_TO_POPOVER: Record<
  components["schemas"]["WarningMessageCode"],
  React.FC<{ warning: components["schemas"]["WarningMessage"]; flight: components["schemas"]["FlightDto"] }>
> = {
  no_rvsm: () => (
    <>
      <p>
        <Trans>The aircraft does not specify RVSM capability.</Trans>
      </p>
      <p>
        <EditFpl />
        <Trans>
          Add
          <span className="text-mono">W</span>
          to equipment code.
        </Trans>
      </p>
      <AircraftCodeCommonHelp type="Equip+T" />
    </>
  ),
  no_rnav1: ({ warning }) => (
    <>
      <p>
        <Trans>The aircraft does not specify RNAV1 capability.</Trans>
      </p>
      <p>
        <EditFpl />
        {warning.field === "equipment" && (
          <>
            <Trans>
              Add
              <span className="text-mono">R</span>
              to equipment code.
            </Trans>
          </>
        )}
        {warning.field === "navigation_performance" && (
          <>
            <Trans>
              Add
              <span className="text-mono">D1</span>
              or
              <span className="text-mono">D2</span>
              to PBN.
            </Trans>
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
      <p>
        <Trans>Transponder field is empty.</Trans>
      </p>
      <p>
        <EditFpl />
        <Trans>Write your transponder equipment code.</Trans>
      </p>
      <AircraftCodeCommonHelp type="Equip+T" />
    </>
  ),
  route_direct_segment: () => null,
  route_leg_direction: () => null,
  airway_require_approval: () => null,
  not_preferred_route: () => null,
  cruising_level_mismatch: ({ warning }) => {
    const level = warning.parameter && CRUISING_LEVEL_TEXT[warning.parameter];
    return (
      <>
        <p>
          {level ? (
            <Trans>
              The cruising level type does not meet the requirement of the route. Cruising level should be {level}.
            </Trans>
          ) : (
            <Trans>
              The cruising level type does not meet the requirement of the route. Please contact ATC for help.
            </Trans>
          )}
        </p>
        <p>
          <EditFpl />
          <Trans>Pick a suitable cruising level.</Trans>
        </p>
        <ChinaRvsmHelp />
      </>
    );
  },
  cruising_level_too_low: ({ warning: { parameter: level } }) => (
    <>
      <p>
        <Trans>The cruising level is too low for route. The minimum is {level} feet.</Trans>
      </p>
      <p>
        <EditFpl />
        <Trans>Pick a suitable cruising level.</Trans>
      </p>
    </>
  ),
  cruising_level_not_allowed: ({ warning: { parameter: level } }) => (
    <>
      <p>
        <Trans>The cruising level is not allowed for the route.</Trans>
      </p>
      <p>
        <Trans>Allowed levels are {level} (in feet).</Trans>
      </p>
      <p>
        <EditFpl />
        <Trans>Pick a suitable cruising level.</Trans>
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
        const content = WARNING_MESSAGE_TO_POPOVER[warning.message_code]?.({ warning, flight }) as React.ReactNode;

        const button = (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              (WARNING_MESSAGE_TO_SEVERITY[warning.message_code] ?? "error") === "error" &&
                "text-destructive hover:text-destructive",
              content && "underline",
            )}
            key={warning.message_code}
          >
            <TbInfoCircleFilled />
            {WARNING_CODE_TO_MESSAGE[warning.message_code] ?? warning.message_code}
          </Button>
        );

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

  const { t } = useLingui();

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
        <Trans>Back</Trans>
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
          <h2 className="text-2xl">
            <Trans>Flight Plan</Trans>
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <FplField label={t`Callsign`} value={flight.callsign} />
            {/* <FplField label="Flight Rules" value="-" /> */}
            {/* <FplField label="Date of Flight" value="-" /> */}
            {/* <FplField label="Voice Rules" value="-" /> */}
            {/* <FplField label="Aircraft Type" value="-" /> */}
            {/* <FplField label="Wake Category" value="-" /> */}
            <FplField label={t`Equipment`}>
              <div className="flex items-center gap-2">
                {flight.equipment && <span className="text-mono">{flight.equipment}</span>}
                <Warning flight={flight} warnings={warnings} field="equipment" />
              </div>
            </FplField>
            <FplField label={t`Transponder`}>
              <div className="flex items-center gap-2">
                {flight.transponder && <span className="text-mono">{flight.transponder}</span>}
                <Warning flight={flight} warnings={warnings} field="transponder" />
              </div>
            </FplField>
            <FplField label={t`Departure`} value={flight.departure} className="col-start-1" />
            {/* <FplField label="Off Block" value="-" /> */}
            {/* <FplField label="Airspeed" value="-" /> */}
            <FplField label={t`Cruising Level (Feet)`}>
              {flight.cruising_level && <span className="text-mono">{flight.cruising_level}</span>}
              <Warning flight={flight} warnings={warnings} field="cruising_level" />
            </FplField>
            <FplField label={t`Route`} className="col-span-4">
              {flight.raw_route && <span className="text-mono">{flight.raw_route}</span>}
              <Warning flight={flight} warnings={warnings} field="route" />
            </FplField>
            <FplField label={t`Arrival`} value={flight.arrival} />
            {/* <FplField label="Enroute Time" value="-" /> */}
            {/* <FplField label="Alternate" value="-" /> */}
            {/* <FplField label="Endurance" value="-" /> */}
            <FplField label={t`PBN`} tooltip={t`Performance Based Navigation`}>
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
          <h2 className="text-2xl">
            <Trans>Validation Result</Trans>
          </h2>
          <FlightWarnings callsign={callsign} />
          <h2 className="text-2xl">
            <Trans>Flight Route</Trans>
          </h2>
          <div className="grid grid-cols-[auto_auto_auto_1fr] gap-x-4 gap-y-1">
            <div className="contents">
              <span className="text-muted-foreground col-1 text-right font-light">
                <Trans>From</Trans>
              </span>
              <span className="text-muted-foreground col-2 text-center font-light">
                <Trans>Via</Trans>
              </span>
              <span className="text-muted-foreground col-3 text-left font-light">
                <Trans>To</Trans>
              </span>
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
