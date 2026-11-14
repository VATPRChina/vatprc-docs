import { FlightDetails } from "@/components/flight/flight-details";
import { FlightRoute } from "@/components/flight/flight-route";
import { RequireRole } from "@/components/require-role";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
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
      <Alert variant={"destructive"}>
        <AlertTitle>{e?.title}</AlertTitle>
        <AlertDescription>{e?.detail}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading || isValidationLoading) {
    return <Skeleton style={{ height: 64 }} />;
  }

  if (!flight || !validation) {
    return (
      <Alert>
        <AlertDescription>
          <Trans>Flight or validation data is missing.</Trans>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="flex items-baseline">
        <span className="text-3xl">{callsign}</span>
        <span className="text-muted-foreground ml-1 flex gap-1 text-2xl">
          <span>{flight.flight_plan.departure}</span>
          <TbPlaneInflight />
          <span>{flight.flight_plan.arrival}</span>
        </span>
      </h1>
      <FlightDetails plan={flight.flight_plan} validation={validation}>
        <RequireRole role="software-engineer">
          <FlightRoute callsign={callsign} />
        </RequireRole>
      </FlightDetails>
    </div>
  );
}
