import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { TbCheck, TbExclamationCircle } from "react-icons/tb";

const messages: Record<components["schemas"]["WarningMessageCode"], React.ReactNode> = {
  no_rvsm: <Trans>The aircraft does not specify RVSM capability.</Trans>,
  no_rnav1: <Trans>The aircraft does not specify RNAV1 capability.</Trans>,
  rnp_ar: (
    <Trans>
      The aircraft specifies RNP AR capability with RF, which is eligible to be cleared with RNP AR procedures when
      possible.
    </Trans>
  ),
  rnp_ar_without_rf: (
    <Trans>
      The aircraft specifies RNP AR capability without RF, which is eligible to be cleared with RNP AR procedures
      without RF when possible.
    </Trans>
  ),
  no_transponder: <Trans>The aircraft does not specify transponder capability.</Trans>,
  route_direct_segment: <Trans>The route contains a direct leg. Please ensure that the direct segment is valid.</Trans>,
  route_leg_direction: <Trans>The route contains a leg with an invalid direction.</Trans>,
  airway_require_approval: <Trans>The route contains an airway that requires controller approval.</Trans>,
  not_preferred_route: <Trans>The flight plan does not match the preferred route for this flight.</Trans>,
  cruising_level_mismatch: <Trans>The cruising level type does not meet the requirement of the route.</Trans>,
  cruising_level_too_low: <Trans>The cruising level is too low for the route.</Trans>,
  cruising_level_not_allowed: <Trans>The cruising level is not allowed for the route.</Trans>,
  route_match_preferred: <Trans>The planned route matches preferred route.</Trans>,
};

const descriptions: Record<
  components["schemas"]["WarningMessageCode"],
  (flight: components["schemas"]["FlightDto"], warning: components["schemas"]["WarningMessage"]) => React.ReactNode
> = {
  no_rvsm: () => (
    <>
      <p>
        <Trans>Aircraft without RVSM capability will not be allowed to enter RVSM airspace.</Trans>
      </p>
      <p>
        <Trans>
          RVSM stands for Reduced Vertical Separation Minima. In the VATPRC airspace, the RVSM altitude range is between
          8,900 meters (29,100 feet) and 12,500 meters (41,100 feet) inclusive, with altitude layers separated by 300
          meters. To enter this airspace, your flight plan must include W in the Equipment field.
        </Trans>
      </p>
    </>
  ),
  no_rnav1: () => (
    <>
      <p>
        <Trans>
          Aircraft without RNAV1 capability will not be assigned RNAV departure or arrival procedures and will be radar
          vectored. Conventional procedures may only be used with ATC approval.
        </Trans>
      </p>
      <p>
        <Trans>
          RNAV stands for Area Navigation. RNAV1 means that the total system error does not exceed 1 NM for 95% of the
          flight time. RNAV1 is used for RNAV departure and arrival procedures and may also be used for area navigation
          routes. However, VATPRC controllers currently only check RNAV1 capability for departure and arrival.
          Navigation standards for en route phases are not checked at this time. For RNAV1, your flight plan must
          include P in the Equipment field and D1 or D2 in the PBN/ field.
        </Trans>
      </p>
    </>
  ),
  rnp_ar: () => null,
  rnp_ar_without_rf: () => null,
  no_transponder: () => <Trans>Transponder field is empty.</Trans>,
  route_direct_segment: () => null,
  route_leg_direction: () => null,
  airway_require_approval: () => null,
  not_preferred_route: ({ raw_route: route }, warning) => {
    const routes = warning.parameter?.split(",").filter((r) => !!r.trim());
    return (
      <>
        <p>
          <Trans>
            The submitted route is:
            <span className="font-mono">{route}</span>
          </Trans>
        </p>
        <p>
          {(routes?.length ?? 0) > 0 ? (
            <Trans>Please choose a preferred route from the following list, or contact ATC for assistance:</Trans>
          ) : (
            <Trans>Please contact ATC for help adjusting the route.</Trans>
          )}
          <ol className="list-decimal font-mono">{routes?.map((route, index) => <li key={index}>{route}</li>)}</ol>
        </p>
      </>
    );
  },
  cruising_level_mismatch: () => null,
  cruising_level_too_low: () => null,
  cruising_level_not_allowed: () => null,
  route_match_preferred: (_, { parameter: route }) => (
    <p>
      <Trans>
        Planned route matches a preferred route:
        <span className="font-mono">{route}</span>
      </Trans>
    </p>
  ),
};

const ALLOWED_MESSAGE_CODES: components["schemas"]["WarningMessageCode"][] = [
  "rnp_ar",
  "rnp_ar_without_rf",
  "route_match_preferred",
];
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
          <AlertTitle className="text-green-700 dark:text-green-500">
            <Trans>Flight looks good. Please confirm with the clearance delivery controller.</Trans>
          </AlertTitle>
        </Alert>
      )}
      {warnings &&
        uniqWith(warnings, (w1, w2) => w1.message_code === w2.message_code).map(
          (warning) =>
            messages[warning.message_code] && (
              <Alert key={warning.message_code}>
                {ALLOWED_MESSAGE_CODES.includes(warning.message_code) ? <TbCheck /> : <TbExclamationCircle />}
                <AlertTitle
                  className={cn(
                    ALLOWED_MESSAGE_CODES.includes(warning.message_code) && "text-green-700 dark:text-green-500",
                  )}
                >
                  {messages[warning.message_code] ?? warning.message_code}
                </AlertTitle>
                <AlertDescription>{flight && descriptions[warning.message_code]?.(flight, warning)}</AlertDescription>
              </Alert>
            ),
        )}
    </div>
  );
};
