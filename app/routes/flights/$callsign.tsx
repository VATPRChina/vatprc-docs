import { FlightWarnings } from "@/components/flight-warnings";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { $api } from "@/lib/client";
import { m } from "@/lib/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { TbArrowLeft } from "react-icons/tb";

export const Route = createFileRoute("/flights/$callsign")({
  component: RouteComponent,
});

function RouteComponent() {
  const { callsign } = Route.useParams();

  const {
    error,
    data: flight,
    isLoading,
  } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}", { params: { path: { callsign } } });

  return (
    <div className="flex flex-col items-start gap-4">
      <LinkButton variant="ghost" to="..">
        <TbArrowLeft />
        {m.route_flights_callsign_back()}
      </LinkButton>
      {error?.message && (
        <Alert color="red">
          <AlertTitle>{error?.message}</AlertTitle>
        </Alert>
      )}
      {isLoading && <Skeleton className="h-48 w-full" />}
      {!error && flight && (
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl">{callsign}</h2>
          <h3 className="text-2xl">
            {flight?.departure} - {flight?.arrival}
          </h3>
          <div className="flex flex-row gap-2">
            <span className="font-mono">{flight?.aircraft}</span>
            <span className="font-light">{m["route_flights_callsign_equipment"]()}</span>
            <span className="font-mono">{flight?.equipment}</span>
            <span className="font-light">{m["navigation_performance"]()}</span>
            <span className="font-mono">{flight?.navigation_performance}</span>
            <span className="font-light">{m["route_flights_callsign_transponder"]()}</span>
            <span className="font-mono">{flight?.transponder}</span>
          </div>
          <div className="text-secondary-foreground flex flex-row gap-2">
            <span className="font-light">{m["route_flights_callsign_route"]()}</span>
            <span className="font-mono">{flight?.__simplified_route}</span>
          </div>
          <FlightWarnings callsign={callsign} />
        </div>
      )}
    </div>
  );
}
