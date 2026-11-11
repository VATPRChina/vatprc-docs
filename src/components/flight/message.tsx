import { StatusColor } from "@/components/ui";
import { components } from "@/lib/api";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { FC, ReactNode } from "react";

export const VALIDATOR_NAMES: Record<components["schemas"]["ValidatorIdentifier"], ReactNode> = {
  callsign: <Trans>callsign</Trans>,
  "flight-rule-weather": <Trans>VFR weather</Trans>,
  "aircraft-type": <Trans>aircraft type</Trans>,
  "wake-category": <Trans>wake category</Trans>,
  "departure-aircraft-type": <Trans>wingspan at departure</Trans>,
  "departure-airport": <Trans>departure airport</Trans>,
  "arrival-aircraft-type": <Trans>wingspan at arrival</Trans>,
  "arrival-airport": <Trans>arrival airport</Trans>,
  "directional-cruise-altitude": <Trans>cruise altitude (without designated route)</Trans>,
  "equipment-rvsm": <Trans>RVSM equipment</Trans>,
  "equipment-rnav1": <Trans>RNAV1 equipment</Trans>,
  "equipment-rnp-ar": <Trans>RNP AR equipment</Trans>,
  "preferred-route": <Trans>designated route</Trans>,
  "preferred-route-cruise-altitude": <Trans>cruise altitude (with designated route)</Trans>,
  "route-direct-leg": <Trans>no direct leg</Trans>,
  "route-unknown-leg-or-fix": <Trans>no unknown leg or fix</Trans>,
  "airway-approval": <Trans>no airway requiring approval</Trans>,
  "airway-direction": <Trans>airway direction restriction</Trans>,
};

interface ValidationStatusDescriptor {
  short: string;
  name: ReactNode;
  color: StatusColor;
}

export const VALIDATION_STATUS: Record<components["schemas"]["ValidatorStatus"], ValidationStatusDescriptor> = {
  pass: { short: "P", name: <Trans>Pass</Trans>, color: "green" },
  suppressed: { short: "S", name: <Trans>Suppressed</Trans>, color: "blue" },
  rejected: { short: "R", name: <Trans>Rejected</Trans>, color: "red" },
  unavailable: { short: "U", name: <Trans>Unavailable</Trans>, color: "yellow" },
};

const METRIC_CURISING_LEVEL_TYPES: components["schemas"]["CruiseAltitudeType"][] = [
  "standard",
  "standard-even",
  "standard-odd",
];

export const CRUISING_LEVEL_TEXT: Record<components["schemas"]["CruiseAltitudeType"], React.ReactElement> = {
  "standard-even": <Trans>metric even flight level</Trans>,
  "standard-odd": <Trans>metric odd flight level</Trans>,
  standard: <Trans>metric flight level</Trans>,
  "flight-level-even": <Trans context="feet">imperial even flight level</Trans>,
  "flight-level-odd": <Trans context="feet">imperial odd flight level</Trans>,
};

export const PROBLEM_LABELS: Record<components["schemas"]["ValidationProblemDto"]["kind"], React.ReactNode> = {
  "aircraft-wingspan-too-large": <Trans>Aircraft wingspan exceeds airport limit</Trans>,
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
  "cruising-level-mismatch": <Trans>Cruising level type mismatch</Trans>,
  "cruising-level-too-low": <Trans>Cruising level too low</Trans>,
  "cruising-level-not-allowed": <Trans>Cruising level not allowed</Trans>,
  "route-match-preferred": <Trans>Match designated route</Trans>,
};

type ProblemByKind = {
  [K in components["schemas"]["ValidationProblemDto"]["kind"]]: Extract<
    components["schemas"]["ValidationProblemDto"],
    { kind: K }
  >;
};

type ProblemOfKind<K extends components["schemas"]["ValidationProblemDto"]["kind"]> = {
  [P in K]: ProblemByKind[P];
}[K];

type ProblemDetailsMap = {
  [K in components["schemas"]["ValidationProblemDto"]["kind"]]: FC<{ problem: ProblemOfKind<K> }>;
};

export const PROBLEM_DETAILS: ProblemDetailsMap = {
  "route-unknown-leg-or-fix": ({ problem: { ident } }) => {
    return (
      <Trans>
        The route contains the unknown leg or fix {ident}. Note: a leg not connecting to the fix specified is also
        unknown.
      </Trans>
    );
  },
  "invalid-airport": () => <Trans>The specified airport could not be resolved as a valid airport.</Trans>,
  "invalid-aircraft-type": () => <Trans>The aircraft type designator is not recognized.</Trans>,
  "wake-category-mismatch": ({ problem: { expected } }) => (
    <Trans>The declared wake category does not match the aircraft type. It should be {expected}.</Trans>
  ),
  "aircraft-wingspan-too-large": ({ problem: { maximum } }) => (
    <Trans>The aircraft wingspan exceeds the airport&apos;s limit {maximum}.</Trans>
  ),
  "no-rvsm": () => (
    <>
      <p>
        <Trans>
          The requested flight level requires RVSM capability, but the flight plan does not specify RVSM capability on
          the aircraft. To indicate RVSM capability, include <code>W</code> in the Equipment field. Contact ATC for
          special clearance if your aircraft cannot meet these requirements.
        </Trans>
      </p>
      <AircraftCodeCommonHelp type="Equip+T" />
    </>
  ),
  "no-rnav1": () => (
    <>
      <p>
        <Trans>
          China mainland airspace requires RNAV1 capability, but the flight plan does not specify RNAV1 capability on
          the aircraft. To indicate RNAV 1 capability, include <code>R</code> in Equipment and&nbsp;
          <code>D1</code>, <code>D2</code>, <code>D3</code> or <code>D4</code> in PBN. Contact ATC for special clearance
          if your aircraft cannot meet these requirements.
        </Trans>
      </p>
      <AircraftCodeCommonHelp type="PBN" />
    </>
  ),
  "rnp-ar": () => (
    <Trans>
      The aircraft specifies RNP AR capability with RF, which is eligible to be cleared with RNP AR procedures when
      possible.
    </Trans>
  ),
  "rnp-ar-without-rf": () => (
    <Trans>
      The aircraft specifies RNP AR capability without RF, which is eligible to be cleared with RNP AR procedures
      without RF when possible.
    </Trans>
  ),
  "no-transponder": () => (
    <>
      <Trans>
        China mainland airspace requires RVSM capability, but the flight plan does not specify transponder capability on
        the aircraft. Contact ATC for special clearance if your aircraft cannot meet these requirements.
      </Trans>
      <AircraftCodeCommonHelp type="Equip+T" />
    </>
  ),
  "route-direct-segment": ({ problem: { from, to } }) => (
    <Trans>
      The route contains a direct leg from {from} to {to}. Please ensure that the direct segment is valid.
    </Trans>
  ),
  "route-leg-direction": ({ problem: { from, ident, to } }) => (
    <Trans>
      The route contains the leg &quot;{from} {ident} {to}&quot; violating direction restriction.
    </Trans>
  ),
  "airway-require-approval": ({ problem: { from, ident, to } }) => (
    <Trans>
      The route contains the airway leg &quot;{from} {ident} {to}&quot; that requires controller approval.
    </Trans>
  ),
  "not-preferred-route": ({ problem: { routes } }) => (
    <>
      <p>
        <Trans>The flight plan does not match a designated route. Use one of the following routes:</Trans>
      </p>
      <ul>
        {routes.map((route, index) => (
          <PreferredRoute key={index} route={route} />
        ))}
      </ul>
    </>
  ),
  "cruising-level-mismatch": ({ problem: { expected_type } }) => {
    const level = CRUISING_LEVEL_TEXT[expected_type];
    return (
      <>
        <p>
          <Trans>The cruising level type does not meet the requirement of the route.</Trans>
        </p>
        <p>
          <Trans>Cruising level should be {level}.</Trans>
        </p>
        {METRIC_CURISING_LEVEL_TYPES.includes(expected_type) && <ChinaRvsmHelp />}
        <p>
          <Trans>
            Note: Cruising level type is relevant to planned route. If the route changes, the required cruising level
            type may change.
          </Trans>
        </p>
      </>
    );
  },
  "cruising-level-not-allowed": ({ problem: { allowlist_ft } }) => {
    const allowed = allowlist_ft.map((f) => `${f} ft`).join(", ");
    return (
      <>
        <Trans>The cruising level is not allowed for the route.</Trans>
        <Trans>Cruising level should be {allowed}.</Trans>
        <ChinaRvsmHelp />
      </>
    );
  },
  "cruising-level-too-low": ({ problem: { minimum_ft } }) => (
    <>
      <Trans>The cruising level is too low for route. The minimum is {minimum_ft} feet.</Trans>
      <ChinaRvsmHelp />
    </>
  ),
  "route-match-preferred": ({ problem: { from, to, raw_route } }) => (
    <>
      <p>
        <Trans>
          The planned route matches the designated route from {from} to {to}.
        </Trans>
      </p>
      <pre className="wrap-break-word whitespace-pre-wrap">
        <code>{raw_route}</code>
      </pre>
    </>
  ),
};

const PreferredRoute = ({ route }: { route: components["schemas"]["PreferredRouteDescriptionDto"] }) => {
  const { t } = useLingui();

  const { allowed_altitudes, cruising_level_restriction, from, minimal_altitude, raw_route, to } = route;

  const allowed = allowed_altitudes.map((altitude) => t`${altitude} ft`).join(t`, `);
  const level = allowed.length > 0 ? t`crusing level of ${allowed}` : CRUISING_LEVEL_TEXT[cruising_level_restriction];
  return (
    <li>
      <Trans>
        From {from} to {to}, use&nbsp;<code>{raw_route}</code>, with {level}.
      </Trans>
      {minimal_altitude > 0 && (
        <>
          &nbsp;<Trans>Keep curising level not below {minimal_altitude} feet.</Trans>
        </>
      )}
    </li>
  );
};

export function ProblemDetails<K extends components["schemas"]["ValidationProblemDto"]["kind"]>({
  problem,
}: {
  problem: ProblemOfKind<K>;
}) {
  const Detail: FC<{ problem: ProblemOfKind<K> }> = PROBLEM_DETAILS[problem.kind];
  return <Detail problem={problem} />;
}

const ChinaRvsmHelp = () => (
  <>
    <p className="hover:text-primary/80 underline">
      <Link to="/airspace/rvsm">
        <Trans>Learn more about China RVSM</Trans>
      </Link>
    </p>
  </>
);

const AircraftCodeCommonHelp = ({ type }: { type: "PBN" | "Equip+T" }) => {
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
          className="w-full max-w-3xl"
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
