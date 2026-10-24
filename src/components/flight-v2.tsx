import { RouteResult } from "@/components/flight-parsed-route";
import { ValidationTag } from "@/components/flight-validations";
import { RequireRole } from "@/components/require-role";
import { formatCruisingLevelInMeters } from "@/lib/altitude";
import type { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Skeleton, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";

type FlightAnalysis = components["schemas"]["FlightV2Dto"];
type Fix = components["schemas"]["FlightRouteFix"];
type Validation = components["schemas"]["ValidatorResult"];
type Field = components["schemas"]["WarningMessageField"];

export function FlightV2({ callsign }: { callsign: string }) {
  return (
    <RequireRole role="software-engineer">
      <AuthorizedFlightV2 callsign={callsign} />
    </RequireRole>
  );
}

function AuthorizedFlightV2({ callsign }: { callsign: string }) {
  const { t } = useLingui();
  const query = $api.useQuery(
    "get",
    "/api/flights/by-callsign/{callsign}/v2",
    { params: { path: { callsign } } },
    { retry: false },
  );
  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-2xl">
        <Trans>Flight V2</Trans>
      </h2>
      {query.isLoading && <Skeleton h={384} aria-label={t`Loading flight analysis`} />}
      {query.error && (
        <Alert color="red" title={query.error.title ?? t`Unable to load flight analysis`}>
          {query.error.detail}
        </Alert>
      )}
      {!query.error && query.data && <FlightV2Result key={callsign} data={query.data} />}
    </div>
  );
}

export function FlightV2Result({ data }: { data: FlightAnalysis }) {
  const { t } = useLingui();
  const flight = data.flight_plan;
  const flightResults = data.validations.filter((result) => result.scope.level === "flight");
  return (
    <section aria-label={t`Flight analysis v2`} className="flex w-full min-w-0 flex-col gap-6">
      <section aria-label={t`Flight Plan`}>
        <h2 className="mb-3 text-2xl">
          <Trans>Flight Plan</Trans>
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <PlanField label={t`Callsign`} field="callsign" results={flightResults}>
            {flight.callsign}
          </PlanField>
          <PlanField label={t`Flight Rules`} field="flight-rules" results={flightResults}>
            {flight.flight_rules}
          </PlanField>
          <PlanField label={t`Aircraft Type`} field="aircraft-type" results={flightResults}>
            {flight.aircraft}
          </PlanField>
          <PlanField label={t`Wake Category`} field="wake-category" results={flightResults}>
            {flight.wake_category}
          </PlanField>
          <PlanField label={t`Equipment`} field="equipment" results={flightResults}>
            {flight.equipment}
          </PlanField>
          <PlanField label={t`Transponder`} field="transponder" results={flightResults}>
            {flight.transponder}
          </PlanField>
          <PlanField label={t`Departure`} field="departure" results={flightResults} className="col-start-1">
            {flight.departure}
          </PlanField>
          <PlanField label={t`Cruising Level`} field="cruising-level" results={flightResults}>
            {flight.cruising_level ? (
              <span>
                {flight.cruising_level} ft{" "}
                <span className="text-muted-foreground text-sm">
                  {formatCruisingLevelInMeters(flight.cruising_level)}
                </span>
              </span>
            ) : (
              "—"
            )}
          </PlanField>
          <PlanField label={t`Route`} field="route" results={flightResults} className="md:col-span-2 lg:col-span-4">
            {flight.raw_route}
          </PlanField>
          <PlanField label={t`Arrival`} field="arrival" results={flightResults}>
            {flight.arrival}
          </PlanField>
          <PlanField label={t`PBN`} field="navigation-performance" results={flightResults}>
            {flight.navigation_performance}
          </PlanField>
        </div>
      </section>
      {data.errors.length > 0 && (
        <Alert color="yellow">
          <Trans>Analysis is incomplete. Only validators with the required inputs are shown.</Trans>
        </Alert>
      )}
      {data.errors.map((error, index) => (
        <Alert key={index} color="red" title={error.stage}>
          {error.message}
        </Alert>
      ))}
      <section aria-label={t`Route segments`} className="flex min-w-0 flex-col gap-4">
        <h2 className="text-2xl">
          <Trans>Route segments</Trans>
        </h2>
        {data.segments == null ? (
          <p className="text-muted-foreground">
            <Trans>Route segments are unavailable. See the diagnostic error above.</Trans>
          </p>
        ) : data.segments.length === 0 ? (
          <p>
            <Trans>No results.</Trans>
          </p>
        ) : (
          data.segments.map((segment, index) => {
            const segmentNumber = index + 1;
            const results = data.validations.filter(
              (result) => result.scope.level === "segment" && result.scope.segment_index === index,
            );
            const report = data.preferred_route_matching?.find((report) => report.segment_index === index);
            return (
              <article
                key={index}
                aria-label={t`Segment ${segmentNumber}`}
                className="flex min-w-0 flex-col gap-4 rounded-lg border border-black/15 p-4 dark:border-white/20"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    <Trans>Segment {segmentNumber}</Trans> · {segment.identifier}
                  </h3>
                  <Badge variant="light">{segment.kind === "mainland" ? t`Mainland` : t`International`}</Badge>
                  <InlineValidations results={results} />
                </div>
                <RouteResult
                  legs={segment.legs}
                  legAnnotations={(offset) => {
                    const legIndex = segment.start_index + offset;
                    const legNumber = legIndex + 1;
                    return (
                      <span aria-label={t`Leg ${legNumber} validations`}>
                        <InlineValidations
                          results={data.validations.filter(
                            (result) =>
                              result.scope.level === "leg" &&
                              result.scope.segment_index === index &&
                              result.scope.leg_index === legIndex,
                          )}
                        />
                      </span>
                    );
                  }}
                />
                <SegmentMetadata segment={segment} />
                <section aria-label={t`Preferred routes`}>
                  <h4 className="mb-2 font-semibold">
                    <Trans>Preferred routes</Trans>
                  </h4>
                  <PreferredRoutes report={report} />
                </section>
              </article>
            );
          })
        )}
      </section>
    </section>
  );
}

function PlanField({
  label,
  field,
  results,
  children,
  className = "",
}: {
  label: string;
  field: Field;
  results: Validation[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-field={field} className={`flex flex-col items-start gap-1 ${className}`}>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-muted-foreground">{label}</span>
        <InlineValidations results={results.filter((result) => result.field === field)} />
      </div>
      <div className="font-mono wrap-break-word">{children || "—"}</div>
    </div>
  );
}

function InlineValidations({ results }: { results: Validation[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {results.map((result) => (
        <ValidationTag key={`${result.validator_ident}:${JSON.stringify(result.scope)}`} result={result} compact />
      ))}
    </span>
  );
}

function PreferredRoutes({ report }: { report?: components["schemas"]["SegmentRouteMatches"] }) {
  const { t } = useLingui();
  if (!report)
    return (
      <p className="text-muted-foreground">
        <Trans>Preferred route matching is unavailable.</Trans>
      </p>
    );
  if (!report.candidates.length)
    return (
      <p className="text-muted-foreground">
        <Trans>No preferred route candidates for this segment.</Trans>
      </p>
    );
  return (
    <>
      {report.candidates.map((candidate, index) => {
        const selected = report.selected_candidate_index === index;
        const start = candidate.start_leg_index + 1;
        const end = candidate.end_leg_index;
        return (
          <details key={index} className="mt-3 rounded border border-black/10 p-3 dark:border-white/15" open={selected}>
            <summary className="cursor-pointer">
              <span className="font-semibold">{candidate.route.name}</span>{" "}
              <Badge
                color={selected ? "green" : candidate.error ? "red" : candidate.matched ? "teal" : "gray"}
                variant="light"
              >
                {selected
                  ? t`Selected match`
                  : candidate.error
                    ? t`Invalid route`
                    : candidate.matched
                      ? t`Matched`
                      : t`No match`}
              </Badge>{" "}
              <span className="text-muted-foreground text-sm">
                {candidate.from.identifier} → {candidate.to.identifier} ·{" "}
                <Trans>
                  Legs {start}–{end}
                </Trans>
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <p className="font-mono wrap-break-word">{candidate.route.raw_route || "—"}</p>
              {candidate.error && <Alert color="red">{candidate.error}</Alert>}
              <p>
                {candidate.airport_pair ? t`Airport pair` : t`Border alternative`} ·{" "}
                {candidate.route.is_public ? t`Public route` : t`Private route`}
              </p>
              <p>
                <Trans>Enroute fixes</Trans>: <FixLabel fix={candidate.enroute_start_fix} /> →{" "}
                <FixLabel fix={candidate.enroute_end_fix} />
              </p>
              <p>
                <Trans>Altitude restriction</Trans>: {candidate.route.cruising_level_restriction} ·{" "}
                <Trans>Minimum altitude</Trans>: {candidate.route.minimal_altitude} ft
              </p>
              <p>
                <Trans>Allowed altitudes</Trans>:{" "}
                {candidate.route.allowed_altitudes.length
                  ? `${candidate.route.allowed_altitudes.join(", ")} ft`
                  : t`No additional restriction`}
              </p>
              {candidate.route.remarks && <p>{candidate.route.remarks}</p>}
            </div>
          </details>
        );
      })}
    </>
  );
}
function FixLabel({ fix }: { fix?: Fix | null }) {
  if (!fix) return <span>—</span>;
  const coordinates =
    fix.latitude == null || fix.longitude == null ? "—" : `${fix.latitude.toFixed(4)}, ${fix.longitude.toFixed(4)}`;
  return (
    <Tooltip label={coordinates}>
      <span className={`font-mono ${fix.is_unknown ? "text-red-600 dark:text-red-400" : ""}`}>{fix.identifier}</span>
    </Tooltip>
  );
}
function SegmentMetadata({ segment }: { segment: components["schemas"]["FlightV2Segment"] }) {
  const { t } = useLingui();
  const rows: [string, Fix | null | undefined, Fix | null | undefined][] = [
    [t`Airport endpoints`, segment.route_start_airport, segment.route_end_airport],
    [t`Enroute fixes`, segment.enroute_start_fix, segment.enroute_end_fix],
    [t`Cross-border entry`, segment.cross_border_enter_start_fix, segment.cross_border_enter_end_fix],
    [t`Cross-border exit`, segment.cross_border_exit_start_fix, segment.cross_border_exit_end_fix],
  ];
  return (
    <dl className="mb-4 grid gap-2 text-sm md:grid-cols-2">
      {rows.map(([label, from, to]) => (
        <div key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd>
            <FixLabel fix={from} /> → <FixLabel fix={to} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
