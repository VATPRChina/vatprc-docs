import { BackButton } from "@/components/back-button";
import { FlightWarnings } from "@/components/flight-warnings";
import { FlightPlan } from "@/components/flight/flight-plan";
import { FlightV2 } from "@/components/flight/flight-v2";
import { RequireRole } from "@/components/require-role";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert, Skeleton } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { TbPlaneInflight } from "react-icons/tb";

export const Route = createFileRoute("/flights/$callsign")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ name: "robots", content: "noindex" }, { title: ctx.params.callsign }],
  }),
});

function RouteComponent() {
  const { callsign } = Route.useParams();

  const {
    error,
    data: flight,
    isLoading,
  } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}", { params: { path: { callsign } } });
  const { error: warningsError } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}/warnings", {
    params: { path: { callsign } },
  });

  return (
    <>
      <div className="flex flex-col items-start gap-4">
        <BackButton />
        {(error ?? warningsError) && (
          <Alert color="red" title={(error ?? warningsError)?.title}>
            {(error ?? warningsError)?.detail}
          </Alert>
        )}
        {isLoading && <Skeleton h={64} />}
        {!error && flight && (
          <div className="flex w-full flex-col gap-2">
            <h1 className="flex items-baseline">
              <span className="text-3xl">{callsign}</span>
              <span className="text-muted-foreground ml-1 flex gap-1 text-2xl">
                <span>{flight.departure}</span>
                <TbPlaneInflight />
                <span>{flight.arrival}</span>
              </span>
            </h1>
            <h2 className="text-2xl">
              <Trans>Flight Plan</Trans>
            </h2>
            <FlightPlan callsign={callsign} />
            <h2 className="text-2xl">
              <Trans>Validation Result</Trans>
            </h2>
            <FlightWarnings callsign={callsign} />
          </div>
        )}
        <RequireRole role="software-engineer">
          <FlightV2 callsign={callsign} />
        </RequireRole>
      </div>
    </>
  );
}
