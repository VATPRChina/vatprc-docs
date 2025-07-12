import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { TbCheck, TbExclamationCircle } from "react-icons/tb";

const messages: Record<components["schemas"]["WarningMessageCode"], string> = {
  no_rvsm: "The aircraft does not specify RVSM capability.",
  no_rnav1: "The aircraft does not specify RNAV1 capability.",
  rnp_ar: "The aircraft specifies RNP AR capability with RF.",
  rnp_ar_without_rf: "The aircraft specifies RNP AR capability without RF.",
  no_transponder: "The aircraft does not specify transponder capability.",
  route_direct_segment: "The route contains a direct leg. Please ensure that the direct segment is valid.",
  route_leg_direction: "The route contains a leg with an invalid direction.",
  airway_require_approval: "The route contains an airway that requires controller approval.",
  not_preferred_route: "The flight plan does not match the preferred route for this flight.",
};

const descriptions: Record<
  components["schemas"]["WarningMessageCode"],
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
  rnp_ar: () => null,
  rnp_ar_without_rf: () => null,
  no_transponder: () => "Transponder field is empty.",
  route_direct_segment: () => null,
  route_leg_direction: () => null,
  airway_require_approval: () => null,
  not_preferred_route: (flight, warning) => (
    <>
      <p>
        The submitted route is: <span className="font-mono">{flight.raw_route}</span>
      </p>
      <p>
        Please choose a preferred route from the following list, or contact ATC for assistance:
        <ol className="list-decimal font-mono">
          {warning.parameter?.split(",").map((route, index) => <li key={index}>{route}</li>)}
        </ol>
      </p>
    </>
  ),
};

const ALLOWED_MESSAGE_CODES: components["schemas"]["WarningMessageCode"][] = ["rnp_ar", "rnp_ar_without_rf"];
const uniqWith = <T,>(arr: T[], fn: (a: T, b: T) => boolean) =>
  arr.filter((element, index) => arr.findIndex((step) => fn(element, step)) === index);

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
      {warnings && (warnings.filter((w) => !ALLOWED_MESSAGE_CODES.includes(w.message_code)).length ?? 0) === 0 && (
        <Alert>
          <TbCheck />
          <AlertTitle>Flight looks good.</AlertTitle>
        </Alert>
      )}
      {warnings &&
        uniqWith(warnings, (w1, w2) => w1.message_code === w2.message_code).map(
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
