import { InlineValidationTooltip } from "./validation";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import type { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";

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
        <Skeleton style={{ height: 64 }} />
      ) : error ? (
        <Alert variant={"destructive"}>
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription>{error.detail}</AlertDescription>
        </Alert>
      ) : !data?.segments.length ? (
        <Alert>
          <AlertDescription>
            <Trans>No route segments.</Trans>
          </AlertDescription>
        </Alert>
      ) : (
        data.segments
          .toSorted((a, b) => a.index - b.index)
          .map((segment) => {
            const legs = segment.legs.toSorted((a, b) => a.index - b.index);
            const segmentNumber = segment.index + 1;
            return (
              <Card key={segment.index} className="flex flex-col gap-2">
                <CardContent>
                  <h3 className="flex flex-wrap items-center gap-2 font-semibold">
                    <Trans>Segment {segmentNumber}</Trans>
                    <Badge>
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
                  <div className={"overflow-x-auto"}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Trans>Leg</Trans>
                          </TableHead>
                          <TableHead>
                            <Trans>From</Trans>
                          </TableHead>
                          <TableHead>
                            <Trans>Route</Trans>
                          </TableHead>
                          <TableHead>
                            <Trans>To</Trans>
                          </TableHead>
                          <TableHead>
                            <Trans>Kind</Trans>
                          </TableHead>
                          <TableHead>
                            <Trans>Validation Result</Trans>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {legs.map((leg) => (
                          <TableRow key={leg.index}>
                            <TableCell>{leg.index + 1}</TableCell>
                            <TableCell>{leg.from_ident}</TableCell>
                            <TableCell>{leg.route_ident ?? "DCT"}</TableCell>
                            <TableCell>{leg.to_ident}</TableCell>
                            <TableCell>
                              <Badge>{leg.leg_kind}</Badge>
                            </TableCell>
                            <TableCell>
                              <InlineValidationTooltip field={{ kind: "leg", index: leg.index }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })
      )}
    </section>
  );
}
