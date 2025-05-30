import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { TbExclamationCircle } from "react-icons/tb";

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
  no_rvsm: (flight) => `Equipment code "${flight.equipment}" does not contain "W" for RVSM.`,
  no_rnav1: (flight) =>
    `Equipment code "${flight.equipment}" does not contain "R" for RNAV1, or navigation performance code "${flight.navigation_performance}" does not contain "D1" or "D2" for RNAV1.`,
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
    <>
      {error?.message && (
        <Alert color="red">
          <AlertTitle>{error?.message}</AlertTitle>
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        {(warnings?.length ?? 0) === 0 && <Alert title={"Flight looks good."} color="green"></Alert>}
        {warnings?.map((warning) => (
          <Alert
            key={warning.message_code}
            color={
              ["no_preferred_route", "parse_route_failed", "rnp_ar", "rnp_ar_without_rf"].includes(warning.message_code)
                ? "blue"
                : "yellow"
            }
          >
            <TbExclamationCircle />
            <AlertTitle>{messages[warning.message_code] ?? warning.message_code}</AlertTitle>
            <AlertDescription>{flight && descriptions[warning.message_code]?.(flight, warning)}</AlertDescription>
          </Alert>
        ))}
      </div>
    </>
  );
};
