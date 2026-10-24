import { FLIGHT_WARNING_MESSAGES } from "./flight/message";
import type { components } from "@/lib/api";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Badge, Popover, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";

export const VALIDATOR_NAMES = {
  callsign: msg`callsign`,
  "flight-rule-weather": msg`VFR weather`,
  "aircraft-type": msg`ICAO aircraft type existence`,
  "wake-category": msg`wake category matches aircraft`,
  "departure-aircraft-type": msg`wingspan limit at departure`,
  "departure-airport": msg`departure airport existence`,
  "arrival-aircraft-type": msg`wingspan limit at arrival`,
  "arrival-airport": msg`arrival airport existence`,
  "cruise-altitude-preferred-route": msg`altitude restriction from designated route`,
  "cruise-altitude-directional": msg`altitude type from first leg`,
  "equipment-rvsm": msg`RVSM capability`,
  "equipment-rnav1": msg`RNAV 1 capability`,
  "equipment-rnp-ar": msg`RNP AR capability`,
  "route-preferred": msg`designated route`,
  "route-direct-leg": msg`no direct route legs`,
  "route-unknown-leg-or-fix": msg`no unknown leg or fix`,
  "route-airway-approval": msg`no airway requiring approval`,
  "route-airway-direction": msg`compliance with airway direction restrictions`,
};

type ValidatorStatus = components["schemas"]["ValidatorStatus"];

export const statuses: Record<ValidatorStatus, { color: string; character: string; label: ReactNode }> = {
  pass: { color: "green", character: "P", label: <Trans>Pass</Trans> },
  suppressed: { color: "teal", character: "S", label: <Trans>Suppressed</Trans> },
  rejected: { color: "red", character: "R", label: <Trans>Rejected</Trans> },
  unavailable: { color: "yellow", character: "U", label: <Trans>Unavailable</Trans> },
};

export function ValidationTag({ result }: { result: components["schemas"]["ValidatorResult"]; compact?: boolean }) {
  const { i18n } = useLingui();
  const name = Object.hasOwn(VALIDATOR_NAMES, result.validator_ident)
    ? i18n._(VALIDATOR_NAMES[result.validator_ident as keyof typeof VALIDATOR_NAMES])
    : result.validator_ident;

  const status = statuses[result.status];
  return (
    <Popover withArrow>
      <Popover.Target>
        <Tooltip label={name}>
          <Badge
            component="button"
            type="button"
            variant="filled"
            color={status.color}
            size="sm"
            radius="xs"
            aria-label={`${name}: ${status.character}`}
          >
            {status.character}
          </Badge>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="flex flex-col gap-2">
          <div>
            <strong className="text-sm">{name}</strong>
            <Badge variant="filled" color={status.color} size="sm" radius="xs" className="ml-2">
              {status.label}
            </Badge>
          </div>
          <ValidationWarnings warnings={result.warnings} />
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

export function ValidationWarnings({ warnings }: { warnings: components["schemas"]["WarningMessage"][] }) {
  if (warnings.length <= 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2">
      {warnings.map((warning, index) => (
        <li key={index} className="flex flex-col gap-1 text-sm wrap-break-word">
          <span>{FLIGHT_WARNING_MESSAGES[warning.message_code]}</span>
          <span className="font-mono">{warning.parameter}</span>
        </li>
      ))}
    </ul>
  );
}
