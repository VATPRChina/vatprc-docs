import type { components } from "@/lib/api";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Card } from "@mantine/core";

type Segment = components["schemas"]["FlightRouteSegment"];
type Fix = components["schemas"]["FlightRouteFix"];
const endpoints = (from?: Fix | null, to?: Fix | null) =>
  from || to ? `${from?.identifier ?? "—"} → ${to?.identifier ?? "—"}` : "—";

export function RouteSegments({ segments }: { segments: Segment[] }) {
  const { t } = useLingui();
  return (
    <section aria-label={t`Route segments`} className="flex flex-col gap-2">
      <h4 className="text-lg font-bold">
        <Trans>Route segments</Trans>
      </h4>
      {segments.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {segments.map((segment, index) => (
            <Card key={`${segment.start_index}:${segment.end_index}`} withBorder padding="sm">
              <h5 className="font-mono font-bold">
                {index + 1}. {segment.identifier}
              </h5>
              <Badge color={segment.kind === "mainland" ? "blue" : "gray"} variant="light" size="sm">
                {segment.kind === "mainland" ? <Trans>China mainland</Trans> : <Trans>International</Trans>}
              </Badge>
              <p className="text-sm text-gray-500">
                <Trans>Leg range</Trans>: [{segment.start_index}, {segment.end_index})
              </p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt>
                  <Trans>Airports</Trans>
                </dt>
                <dd className="font-mono">{endpoints(segment.route_start_airport, segment.route_end_airport)}</dd>
                <dt>
                  <Trans>Enroute</Trans>
                </dt>
                <dd className="font-mono">{endpoints(segment.enroute_start_fix, segment.enroute_end_fix)}</dd>
                <dt>
                  <Trans>Border entry</Trans>
                </dt>
                <dd className="font-mono">
                  {endpoints(segment.cross_border_enter_start_fix, segment.cross_border_enter_end_fix)}
                </dd>
                <dt>
                  <Trans>Border exit</Trans>
                </dt>
                <dd className="font-mono">
                  {endpoints(segment.cross_border_exit_start_fix, segment.cross_border_exit_end_fix)}
                </dd>
              </dl>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <Trans>No route segments.</Trans>
        </Alert>
      )}
    </section>
  );
}
