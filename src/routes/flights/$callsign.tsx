import { FlightPlan } from "@/components/flight/flight-plan";
import { FlightValidationContext, ValidationResult } from "@/components/flight/validation";
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
  const {
    error: validationError,
    data: validation,
    isLoading: isValidationLoading,
  } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}/validation", { params: { path: { callsign } } });

  if (error || validationError) {
    const e = error ?? validationError;
    return (
      <Alert color="red" title={e?.title}>
        {e?.detail}
      </Alert>
    );
  }

  if (isLoading || isValidationLoading) {
    return <Skeleton h={64} />;
  }

  if (!flight || !validation) {
    return (
      <Alert>
        <Trans>Flight or validation data is missing.</Trans>
      </Alert>
    );
  }

  return (
    <FlightValidationContext.Provider value={validation ?? null}>
      <div className="flex w-full flex-col gap-2">
        <h1 className="flex items-baseline">
          <span className="text-3xl">{callsign}</span>
          <span className="text-muted-foreground ml-1 flex gap-1 text-2xl">
            <span>{flight.flight_plan.departure}</span>
            <TbPlaneInflight />
            <span>{flight.flight_plan.arrival}</span>
          </span>
        </h1>
        <h2 className="text-2xl">
          <Trans>Flight Plan</Trans>
        </h2>
        <FlightPlan callsign={callsign} />
        <h2 className="text-2xl">
          <Trans>Validation Result</Trans>
        </h2>
        <ValidationResult />
      </div>
    </FlightValidationContext.Provider>
  );
}
