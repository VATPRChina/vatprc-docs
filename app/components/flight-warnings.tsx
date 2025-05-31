import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { TbCheck, TbExclamationCircle } from "react-icons/tb";

const messages: Record<string, string> = {
  no_rvsm: "The aircraft does not specify RVSM capability.",
  no_rnav1: "The aircraft does not specify RNAV1 capability.",
  rnp_ar: "The aircraft specifies RNP AR capability with RF.",
  rnp_ar_without_rf: "The aircraft specifies RNP AR capability without RF.",
  no_transponder: "The aircraft does not specify transponder capability.",
  no_preferred_route: "There is no CAAC preferred route for the aircraft.",
  not_preferred_route: "The aircraft does not follow the CAAC preferred route.",
  parse_route_failed: "The server failed to parse planned route.",
};

const descriptions: Record<
  string,
  (flight: components["schemas"]["FlightDto"], warning: components["schemas"]["WarningMessage"]) => React.ReactNode
> = {
  no_rvsm: () => (
    <>
      <p>Aircraft without RVSM capability will not be allowed to enter RVSM airspace.</p>
      <p>
        RVSM stands for Reduced Vertical Separation Minima. In the VATPRC airspace, the RVSM altitude range is between
        8,900 meters (29,100 feet) and 12,500 meters (41,100 feet) inclusive, with altitude layers separated by 300
        meters. To enter this airspace, your flight plan must include W in the Equipment field.
      </p>
    </>
  ),
  no_rnav1: () => (
    <>
      <p>
        Aircraft without RNAV1 capability will not be assigned RNAV departure or arrival procedures and will be radar
        vectored. Conventional procedures may only be used with ATC approval.
      </p>
      <p>
        RNAV stands for Area Navigation. RNAV1 means that the total system error does not exceed 1 NM for 95% of the
        flight time. RNAV1 is used for RNAV departure and arrival procedures and may also be used for area navigation
        routes. However, VATPRC controllers currently only check RNAV1 capability for departure and arrival. Navigation
        standards for en route phases are not checked at this time. For RNAV1, your flight plan must include P in the
        Equipment field and D1 or D2 in the PBN/ field.
      </p>
    </>
  ),
  rnp_ar: () => "",
  rnp_ar_without_rf: () => "",
  no_transponder: () => "Transponder field is empty.",
  no_preferred_route: (flight) =>
    `Our database does not contain a preferred route for the flight ${flight.departure}-${flight.arrival}. Please follow controller instructions.`,
  not_preferred_route: (flight, message) =>
    `The route in flight plan "${flight.__simplified_route}" does not match the preferred route "${(
      message.parameter?.split(";") ?? []
    ).join('" or "')}".`,
  parse_route_failed: (flight, message) =>
    `Failed to parse the flight route "${flight.raw_route}" due to: ${message.parameter}`,
};

export const FlightWarnings = ({ callsign }: { callsign: string }) => {
  const { data: flight } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}", {
    params: { path: { callsign } },
  });
  const {
    isLoading,
    error,
    data: warnings,
  } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}/warnings", { params: { path: { callsign } } });

  if (isLoading) return <Skeleton className="h-16 w-full" />;
  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      {error?.message && (
        <Alert color="red">
          <AlertTitle>{error?.message}</AlertTitle>
        </Alert>
      )}
      {(warnings?.length ?? 0) === 0 && (
        <Alert>
          <TbCheck />
          <AlertTitle>Flight looks good.</AlertTitle>
        </Alert>
      )}
      {warnings?.map(
        (warning) =>
          messages[warning.message_code] && (
            <Alert key={warning.message_code}>
              <TbExclamationCircle />
              <AlertTitle>{messages[warning.message_code] ?? warning.message_code}</AlertTitle>
              <AlertDescription>{flight && descriptions[warning.message_code]?.(flight, warning)}</AlertDescription>
            </Alert>
          ),
      )}
    </div>
  );
};
