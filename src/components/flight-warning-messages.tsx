import type { components } from "@/lib/api";
import { Trans } from "@lingui/react/macro";

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
