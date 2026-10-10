import { FLIGHT_WARNING_MESSAGES } from "@/components/flight-warning-messages";
import type { components } from "@/lib/api";
import { $api, usePermissions } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Badge, Popover, Tooltip } from "@mantine/core";
import { createContext, useContext, type ReactNode } from "react";

type ValidatorStatus = components["schemas"]["ValidatorStatus"];

const statuses: Record<ValidatorStatus, { color: string; character: string; label: ReactNode }> = {
  pass: { color: "green", character: "P", label: <Trans>Pass</Trans> },
  suppressed: { color: "lime", character: "S", label: <Trans>Suppressed</Trans> },
  rejected: { color: "red", character: "R", label: <Trans>Rejected</Trans> },
  unavailable: { color: "yellow", character: "U", label: <Trans>Unavailable</Trans> },
};

type ValidationQuery = ReturnType<typeof useValidations>;
const ValidationContext = createContext<ValidationQuery | null>(null);

function useValidations(callsign: string) {
  return $api.useQuery(
    "get",
    "/api/flights/by-callsign/{callsign}/validations",
    { params: { path: { callsign } } },
    { retry: false },
  );
}

export function FlightValidationProvider({ callsign, children }: { callsign: string; children: ReactNode }) {
  const roles = usePermissions();
  if (!roles.includes("software-engineer")) return <ValidationContext value={null}>{children}</ValidationContext>;
  return <AuthorizedValidationProvider callsign={callsign}>{children}</AuthorizedValidationProvider>;
}

function AuthorizedValidationProvider({ callsign, children }: { callsign: string; children: ReactNode }) {
  const query = useValidations(callsign);
  return <ValidationContext value={query}>{children}</ValidationContext>;
}

export function FlightValidationTags({ field }: { field: components["schemas"]["WarningMessageField"] }) {
  const query = useContext(ValidationContext);
  if (!query || query.error) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {query.data
        ?.filter((result) => result.field === field)
        .map((result) => (
          <ValidationTag key={result.validator_ident} result={result} />
        ))}
    </span>
  );
}

function ValidationTag({ result }: { result: components["schemas"]["ValidatorResult"] }) {
  const status = statuses[result.status];
  return (
    <Popover width={360} position="bottom-start" withArrow shadow="md">
      <Popover.Target>
        <Tooltip label={result.validator_ident}>
          <Badge
            component="button"
            type="button"
            variant="filled"
            color={status.color}
            size="sm"
            radius="sm"
            className="cursor-pointer"
            style={{ paddingInline: 5, minWidth: 20 }}
            aria-label={`${result.validator_ident}: ${status.character}`}
          >
            {status.character}
          </Badge>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="flex flex-col gap-2">
          <strong className="font-mono text-sm wrap-break-word">{result.validator_ident}</strong>
          <div>{status.label}</div>
          <ValidationWarnings warnings={result.warnings} />
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

function ValidationWarnings({ warnings }: { warnings: components["schemas"]["WarningMessage"][] }) {
  return warnings.length ? (
    <ul className="flex flex-col gap-2">
      {warnings.map((warning, index) => (
        <li key={index} className="flex flex-col gap-1 text-sm wrap-break-word">
          <span>{FLIGHT_WARNING_MESSAGES[warning.message_code]}</span>
          <span className="font-mono">
            {warning.message_code} ({warning.field}
            {warning.field_index != null && `[${warning.field_index}]`})
            {warning.parameter != null && `: ${warning.parameter}`}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <span className="text-muted-foreground">
      <Trans>No warnings</Trans>
    </span>
  );
}
