import { FlightWarnings } from "@/components/flight-warnings";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/button-link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { $api } from "@/lib/client";
import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { TbArrowLeft, TbInfoCircleFilled, TbPlaneInflight } from "react-icons/tb";

export const Route = createFileRoute("/flights/$callsign")({
  component: RouteComponent,
});

const EditFpl = () => (
  <a
    href="https://my.vatsim.net/pilots/flightplan/"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-primary/80 underline"
  >
    VATSIM
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

interface WarningTipProps {
  enabled?: boolean;
  text: string;
  children?: React.ReactNode;
}
const WarningTip = ({ enabled, text, children, ...props }: WarningTipProps & React.ComponentProps<typeof Popover>) => {
  if (!enabled) return null;

  const helpLink =
    getLocale() == "en" ? "https://community.vatprc.net/t/topic/9700" : "https://community.vatprc.net/t/topic/9695";

  return (
    <Popover {...props}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <TbInfoCircleFilled />
          {text}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-max">
        {children}
        <p className="hover:text-primary/80 underline">
          <a href={helpLink} target="_blank" rel="noopener noreferrer">
            Learn more
          </a>
        </p>
      </PopoverContent>
    </Popover>
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

  const noRvsmWarning = warnings?.find((w) => w.message_code === "no_rvsm");
  const noRnav1Equip = warnings?.find((w) => w.message_code === "no_rnav1_equipment");
  const noRnav1Pbn = warnings?.find((w) => w.message_code === "no_rnav1_pbn");
  const noTransponder = warnings?.find((w) => w.message_code === "no_transponder");

  return (
    <div className="flex flex-col items-start gap-4">
      <LinkButton variant="ghost" to="..">
        <TbArrowLeft />
        {m.route_flights_callsign_back()}
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
                <WarningTip enabled={!!noRvsmWarning} text="RVSM">
                  <p>The aircraft does not specify RVSM capability.</p>
                  <p>
                    Edit your flight plan on <EditFpl />: Add <span className="text-mono">W</span> to Equipment Code.
                  </p>
                </WarningTip>
                <WarningTip enabled={!!noRnav1Equip} text="RNAV1">
                  <p>The aircraft does not specify RNAV1 capability.</p>
                  <p>
                    Edit your flight plan on <EditFpl />: Add <span className="text-mono">R</span> to Equipment Code.
                  </p>
                </WarningTip>
              </div>
            </FplField>
            <FplField label="Transponder">
              <div className="flex items-center gap-2">
                {flight.transponder && <span className="text-mono">{flight.transponder}</span>}
                <WarningTip enabled={!!noTransponder} text="Transponder">
                  <p>Transponder field is empty.</p>
                  <p>
                    Edit your flight plan on <EditFpl />: Write your transponder capability.
                  </p>
                </WarningTip>
              </div>
            </FplField>
            <FplField label="Departure" value={flight.departure} className="col-start-1" />
            {/* <FplField label="Off Block" value="-" /> */}
            {/* <FplField label="Airspeed" value="-" /> */}
            {/* <FplField label="Altitude" value="-" /> */}
            <FplField label="Route" value={flight.raw_route} className="col-span-4" />
            <FplField label="Arrival" value={flight.arrival} />
            {/* <FplField label="Enroute Time" value="-" /> */}
            {/* <FplField label="Alternate" value="-" /> */}
            {/* <FplField label="Endurance" value="-" /> */}
            <FplField label="PBN" tooltip="Performance Based Navigation">
              <div className="flex items-center gap-2">
                {flight.navigation_performance && <span className="text-mono">{flight.navigation_performance}</span>}
                <WarningTip enabled={!!noRnav1Pbn} text="RNAV1">
                  <p>The aircraft does not specify RNAV1 capability.</p>
                  <p>
                    Edit your flight plan on <EditFpl />: Add <span className="text-mono">D1</span> or{" "}
                    <span className="text-mono">D2</span> to PBN.
                  </p>
                </WarningTip>
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
          <div className="grid grid-cols-[auto_auto_auto_1fr] gap-x-2 gap-y-1">
            <div className="contents">
              <span className="text-muted-foreground col-1 text-right font-light">From</span>
              <span className="text-muted-foreground col-2 text-center font-light">Via</span>
              <span className="text-muted-foreground col-3 text-left font-light">To</span>
            </div>
            {route &&
              route.map((r) => (
                <div key={`${r.from.identifier}-${r.leg_identifier}-${r.to.identifier}`} className="contents font-mono">
                  <span className="col-1 text-right">{r.from.identifier}</span>
                  <span className="col-2 text-center">{r.leg_identifier}</span>
                  <span className="col-3 text-left">{r.to.identifier}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
