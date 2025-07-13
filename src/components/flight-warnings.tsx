import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { m } from "@/lib/i18n/messages";
import { TbCheck, TbExclamationCircle } from "react-icons/tb";

const messages: Record<components["schemas"]["WarningMessageCode"], string> = {
  no_rvsm: m.warning_title_no_rvsm(),
  no_rnav1: m.warning_title_no_rnav1(),
  rnp_ar: m.warning_title_rnp_ar(),
  rnp_ar_without_rf: m.warning_title_rnp_ar_without_rf(),
  no_transponder: m.warning_title_no_transponder(),
  route_direct_segment: m.warning_title_route_direct_segment(),
  route_leg_direction: m.warning_title_route_leg_direction(),
  airway_require_approval: m.warning_title_airway_require_approval(),
  not_preferred_route: m.warning_title_not_preferred_route(),
  cruising_level_mismatch: m.warning_title_cruising_level_mismatch(),
  cruising_level_too_low: m.warning_title_cruising_level_too_low(),
  cruising_level_not_allowed: m.warning_title_cruising_level_not_allowed(),
};

const descriptions: Record<
  components["schemas"]["WarningMessageCode"],
  (flight: components["schemas"]["FlightDto"], warning: components["schemas"]["WarningMessage"]) => React.ReactNode
> = {
  no_rvsm: () => (
    <>
      <p>{m["warning_description_no_rvsm_1"]()}</p>
      <p>{m["warning_description_no_rvsm_2"]()}</p>
    </>
  ),
  no_rnav1: () => (
    <>
      <p>{m["warning_description_no_rnav1_1"]()}</p>
      <p>{m["warning_description_no_rnav1_2"]()}</p>
    </>
  ),
  rnp_ar: () => null,
  rnp_ar_without_rf: () => null,
  no_transponder: () => m["warning_description_transponder"](),
  route_direct_segment: () => null,
  route_leg_direction: () => null,
  airway_require_approval: () => null,
  not_preferred_route: (flight, warning) => {
    const routes = warning.parameter?.split(",").filter((r) => !!r.trim());
    return (
      <>
        <p>
          {m["warning_description_not_preferred_route_route_is"]()}
          <span className="font-mono">{flight.raw_route}</span>
        </p>
        <p>
          {(routes?.length ?? 0) > 0
            ? m["warning_description_not_preferred_route_choose"]()
            : m["warning_description_not_preferred_route_atc"]()}
          <ol className="list-decimal font-mono">{routes?.map((route, index) => <li key={index}>{route}</li>)}</ol>
        </p>
      </>
    );
  },
  cruising_level_mismatch: () => null,
  cruising_level_too_low: () => null,
  cruising_level_not_allowed: () => null,
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
          <AlertTitle>{m["warning_short_ok"]()}</AlertTitle>
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
