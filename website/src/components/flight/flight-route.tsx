import { InlineValidationTooltip } from "./validation";
import type { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert, Badge, Paper, Skeleton, Table } from "@mantine/core";

export function FlightRoute({ callsign }: { callsign: string }) {
  const { data, error, isLoading } = $api.useQuery(
    "get",
    "/api/flights/by-callsign/{callsign}/route",
    { params: { path: { callsign } } },
    { retry: false },
  );

  return <FlightRouteView data={data} error={error} isLoading={isLoading} />;
}

export function FlightRouteView({
  data,
  error,
  isLoading = false,
}: {
  data?: components["schemas"]["FlightRouteDto"];
  error?: Pick<components["schemas"]["ProblemDetails"], "title" | "detail"> | null;
  isLoading?: boolean;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl">
        <Trans>Resolved Route</Trans>
      </h2>
      {isLoading ? (
        <Skeleton h={64} />
      ) : error ? (
        <Alert color="red" title={error.title}>
          {error.detail}
        </Alert>
      ) : !data?.segments.length ? (
        <Alert>
          <Trans>No route segments.</Trans>
        </Alert>
      ) : (
        data.segments
          .toSorted((a, b) => a.index - b.index)
          .map((segment) => {
            const legs = segment.legs.toSorted((a, b) => a.index - b.index);
            const segmentNumber = segment.index + 1;
            return (
              <Paper key={segment.index} withBorder p="sm" className="flex flex-col gap-2">
                <h3 className="flex flex-wrap items-center gap-2 font-semibold">
                  <Trans>Segment {segmentNumber}</Trans>
                  <Badge variant="light">
                    {segment.kind === "hong_kong" ? (
                      <Trans>Hong Kong</Trans>
                    ) : segment.kind === "mainland" ? (
                      <Trans>Mainland</Trans>
                    ) : (
                      <Trans>International</Trans>
                    )}
                  </Badge>
                  <span>
                    {segment.initial_fix} → {segment.last_fix}
                  </span>
                  {legs.length > 0 && (
                    <InlineValidationTooltip
                      field={{ kind: "multiple-legs", from: legs[0].index, to: legs[legs.length - 1].index + 1 }}
                    />
                  )}
                </h3>
                <p className="text-sm">
                  <Trans>Enroute</Trans>: {segment.enroute_initial_fix} → {segment.enroute_last_fix}
                </p>
                <Table.ScrollContainer minWidth={560}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>
                          <Trans>Leg</Trans>
                        </Table.Th>
                        <Table.Th>
                          <Trans>From</Trans>
                        </Table.Th>
                        <Table.Th>
                          <Trans>Route</Trans>
                        </Table.Th>
                        <Table.Th>
                          <Trans>To</Trans>
                        </Table.Th>
                        <Table.Th>
                          <Trans>Kind</Trans>
                        </Table.Th>
                        <Table.Th>
                          <Trans>Validation Result</Trans>
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {legs.map((leg) => (
                        <Table.Tr key={leg.index}>
                          <Table.Td>{leg.index + 1}</Table.Td>
                          <Table.Td>{leg.from_ident}</Table.Td>
                          <Table.Td>{leg.route_ident ?? "DCT"}</Table.Td>
                          <Table.Td>{leg.to_ident}</Table.Td>
                          <Table.Td>
                            <Badge variant="light">{leg.leg_kind}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <InlineValidationTooltip field={{ kind: "leg", index: leg.index }} />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Paper>
            );
          })
      )}
    </section>
  );
}
