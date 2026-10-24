import { components } from "@/lib/api";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";

export const CRUISING_LEVEL_TEXT: Record<string, React.ReactElement> = {
  standard_even: <Trans>China RVSM even flight level</Trans>,
  standard_odd: <Trans>China RVSM odd flight level</Trans>,
  standard: <Trans>China RVSM flight level</Trans>,
  flight_level_even: <Trans context="feet">even flight level</Trans>,
  flight_level_odd: <Trans context="feet">odd flight level</Trans>,
  flight_level: <Trans context="feet">flight level</Trans>,
};

export const WARNING_MESSAGE_TO_SEVERITY: Record<components["schemas"]["WarningMessageCode"], "error" | "warning"> = {
  "invalid-aircraft-type": "error",
  "wake-category-mismatch": "error",
  "invalid-airport": "error",
  "no-rvsm": "error",
  "no-rnav1": "error",
  "rnp-ar": "warning",
  "rnp-ar-without-rf": "warning",
  "no-transponder": "error",
  "route-unknown-leg-or-fix": "error",
  "route-direct-segment": "error",
  "route-leg-direction": "error",
  "airway-require-approval": "error",
  "not-preferred-route": "error",
  "cruising-level-mismatch": "error",
  "cruising-level-too-low": "error",
  "cruising-level-not-allowed": "error",
  "route-match-preferred": "warning",
};

export const WARNING_CODE_TO_MESSAGE: Record<components["schemas"]["WarningMessageCode"], React.ReactNode> = {
  "invalid-aircraft-type": <Trans>Invalid aircraft type</Trans>,
  "wake-category-mismatch": <Trans>Wake category mismatch</Trans>,
  "invalid-airport": <Trans>Invalid airport</Trans>,
  "no-rvsm": <Trans>No RVSM</Trans>,
  "no-rnav1": <Trans>No RNAV1</Trans>,
  "rnp-ar": <Trans>RNP AR</Trans>,
  "rnp-ar-without-rf": <Trans>RNP AR without RF</Trans>,
  "no-transponder": <Trans>No transponder</Trans>,
  "route-unknown-leg-or-fix": <Trans>Unknown leg or fix</Trans>,
  "route-direct-segment": <Trans>Direct leg</Trans>,
  "route-leg-direction": <Trans>Leg direction violation</Trans>,
  "airway-require-approval": <Trans>Restricted airway</Trans>,
  "not-preferred-route": <Trans>Not designated route</Trans>,
  "cruising-level-mismatch": <Trans>Cruising Level Type Mismatch</Trans>,
  "cruising-level-too-low": <Trans>Cruising Level Too Low</Trans>,
  "cruising-level-not-allowed": <Trans>Cruising Level Not Allowed</Trans>,
  "route-match-preferred": <Trans>Match designated route</Trans>,
};

export const WARNING_MESSAGE_TO_POPOVER: Record<
  components["schemas"]["WarningMessageCode"],
  React.FC<{ warning: components["schemas"]["WarningMessage"]; flight: components["schemas"]["FlightDto"] }>
> = {
  "no-rvsm": () => (
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
  "no-rnav1": ({ warning }) => (
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
        {warning.field === "navigation-performance" && (
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
  "invalid-airport": () => null,
  "rnp-ar": () => null,
  "rnp-ar-without-rf": () => null,
  "no-transponder": () => (
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
  "route-unknown-leg-or-fix": () => null,
  "route-direct-segment": () => null,
  "route-leg-direction": () => null,
  "airway-require-approval": () => null,
  "not-preferred-route": () => null,
  "cruising-level-mismatch": ({ warning }) => {
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
  "cruising-level-too-low": ({ warning: { parameter: level } }) => (
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
  "cruising-level-not-allowed": ({ warning: { parameter: level } }) => (
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
  "invalid-aircraft-type": () => null,
  "wake-category-mismatch": ({ warning: { parameter: categories } }) => (
    <Trans>Expected wake category: {categories}.</Trans>
  ),
  "route-match-preferred": () => null,
};

export const ChinaRvsmHelp = () => (
  <>
    <p className="hover:text-primary/80 underline">
      <Link to="/airspace/rvsm">
        <Trans>Learn more about China RVSM</Trans>
      </Link>
    </p>
  </>
);

export const AircraftCodeCommonHelp = ({ type }: { type: "PBN" | "Equip+T" }) => {
  const { i18n } = useLingui();
  const locale = i18n.locale;
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
          className="w-240 max-w-screen"
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
export const EditFpl = () => (
  <a
    href="https://my.vatsim.net/pilots/flightplan/"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-primary/80 underline"
  >
    <Trans>Edit your flight plan on VATSIM.</Trans>
  </a>
);
export const FLIGHT_WARNING_MESSAGES: Record<components["schemas"]["WarningMessageCode"], React.ReactNode> = {
  "invalid-aircraft-type": <Trans>The aircraft type designator is not recognized.</Trans>,
  "wake-category-mismatch": <Trans>The declared wake category does not match the aircraft type.</Trans>,
  "invalid-airport": <Trans>The specified airport could not be resolved as a valid airport.</Trans>,
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
  "route-unknown-leg-or-fix": <Trans>The route contains an unknown leg or fix.</Trans>,
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
