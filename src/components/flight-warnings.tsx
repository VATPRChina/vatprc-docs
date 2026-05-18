import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { ChinaRvsmHelp, CRUISING_LEVEL_TEXT } from "@/routes/flights/$callsign";
import { Trans } from "@lingui/react/macro";
import { Alert, Skeleton } from "@mantine/core";
import { TbCheck, TbExclamationCircle } from "react-icons/tb";

const messages: Record<components["schemas"]["WarningMessageCode"], React.ReactNode> = {
  "no-rvsm": <Trans>The aircraft does not specify RVSM capability.</Trans>,
  "no-rnav1": <Trans>The aircraft does not specify RNAV1 capability.</Trans>,
  "rnp-ar": (
    <Trans>
      The aircraft specifies RNP AR capability with RF, which is eligible to be cleared with RNP AR procedures when
      possible.
    </Trans>
  ),
  "rnp-ar-without-rf": (
    <Trans>
      The aircraft specifies RNP AR capability without RF, which is eligible to be cleared with RNP AR procedures
      without RF when possible.
    </Trans>
  ),
  "no-transponder": <Trans>The aircraft does not specify transponder capability.</Trans>,
  "route-direct-segment": (
    <Trans>The route contains a direct leg. Please ensure that the direct segment is valid.</Trans>
  ),
  "route-leg-direction": <Trans>The route contains a leg with an invalid direction.</Trans>,
  "airway-require-approval": <Trans>The route contains an airway that requires controller approval.</Trans>,
  "not-preferred-route": <Trans>The flight plan does not match the designated route for this flight.</Trans>,
  "cruising-level-mismatch": <Trans>The cruising level type does not meet the requirement of the route.</Trans>,
  "cruising-level-too-low": <Trans>The cruising level is too low for the route.</Trans>,
  "cruising-level-not-allowed": <Trans>The cruising level is not allowed for the route.</Trans>,
  "route-match-preferred": <Trans>The planned route matches designated route.</Trans>,
};

const descriptions: Record<
  components["schemas"]["WarningMessageCode"],
  (flight: components["schemas"]["FlightDto"], warning: components["schemas"]["WarningMessage"]) => React.ReactNode
> = {
  "no-rvsm": () => (
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
  "no-rnav1": () => (
    <>
      <p>
        <Trans>
          RNAV1 is implemented in the entire VATPRC airspace. It is not possible to follow enroute airways or standard
          departure / arrival procedures without RNAV1 capability. Please contact ATC for special clearance.
        </Trans>
      </p>
    </>
  ),
  "rnp-ar": () => null,
  "rnp-ar-without-rf": () => null,
  "no-transponder": () => <Trans>Transponder field is empty.</Trans>,
  "route-direct-segment": () => null,
  "route-leg-direction": () => null,
  "airway-require-approval": () => null,
  "not-preferred-route": ({ raw_route: route }, warning) => {
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
            <Trans>Please choose a designated route from the following list, or contact ATC for assistance:</Trans>
          ) : (
            <Trans>Please contact ATC for help adjusting the route.</Trans>
          )}
        </p>
        <ol className="list-decimal font-mono">
          {routes?.map((route, index) => (
            <li key={index}>{route}</li>
          ))}
        </ol>
      </>
    );
  },
  "cruising-level-mismatch": (_, warning) => {
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
          <Trans>Pick a suitable cruising level.</Trans>
        </p>
        <ChinaRvsmHelp />
      </>
    );
  },
  "cruising-level-too-low": (_, { parameter: level }) => (
    <>
      <p>
        <Trans>The cruising level is too low for route. The minimum is {level} feet.</Trans>
      </p>
      <p>
        <Trans>Pick a suitable cruising level.</Trans>
      </p>
    </>
  ),
  "cruising-level-not-allowed": (_, { parameter: level }) => (
    <>
      <p>
        <Trans>The cruising level is not allowed for the route.</Trans>
      </p>
      <p>
        <Trans>Allowed levels are {level} (in feet).</Trans>
      </p>
      <p>
        <Trans>Pick a suitable cruising level.</Trans>
      </p>
      <ChinaRvsmHelp />
    </>
  ),
  "route-match-preferred": (_, { parameter: route }) => (
    <p>
      <Trans>
        Planned route matches a designated route:
        <span className="font-mono">{route}</span>
      </Trans>
    </p>
  ),
};

const ALLOWED_MESSAGE_CODES: components["schemas"]["WarningMessageCode"][] = [
  "rnp-ar",
  "rnp-ar-without-rf",
  "route-match-preferred",
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

  if (isLoading) return <Skeleton h={16} />;
  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      {error?.title && <Alert color="red">{error?.title}</Alert>}
      {warnings && (warnings.filter((w) => !ALLOWED_MESSAGE_CODES.includes(w.message_code)).length ?? 0) === 0 && (
        <Alert color="green" icon={<TbCheck />}>
          <Trans>Flight looks good. Please confirm with the clearance delivery controller.</Trans>
        </Alert>
      )}
      {warnings &&
        uniqWith(warnings, (w1, w2) => w1.message_code === w2.message_code).map(
          (warning) =>
            messages[warning.message_code] && (
              <Alert
                icon={ALLOWED_MESSAGE_CODES.includes(warning.message_code) ? <TbCheck /> : <TbExclamationCircle />}
                key={warning.message_code}
                color={(ALLOWED_MESSAGE_CODES.includes(warning.message_code) && "green") || undefined}
                title={messages[warning.message_code] ?? warning.message_code}
              >
                {flight && descriptions[warning.message_code]?.(flight, warning)}
              </Alert>
            ),
        )}
    </div>
  );
};
