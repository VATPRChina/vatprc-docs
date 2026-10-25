import { LinkButton } from "@/components/ui/link-button";
import type { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Skeleton, TextInput } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { TbPlaneOff } from "react-icons/tb";

function FlightCard({
  flight: { cid, flight_plan: plan },
  mine,
}: {
  flight: components["schemas"]["FlightDto"];
  mine?: boolean;
}) {
  return (
    <Link
      to="/flights/$callsign"
      params={{ callsign: plan.callsign }}
      className={cn("flex flex-col gap-1 border px-3 py-2", mine && "border-red-700 dark:border-red-300")}
    >
      <span className="text-lg font-bold">
        {plan.callsign}
        <span className="ml-1 text-sm font-light">{cid}</span>
      </span>
      <div className="flex items-center gap-1">
        <span>{plan.departure}</span>
        <span className="mx-1 font-mono text-xs font-light text-gray-400">{plan.aircraft}</span>
        <span>{plan.arrival}</span>
      </div>
    </Link>
  );
}

export function FlightSearch() {
  const { t } = useLingui();
  const [filter, setFilter] = useState("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const validDeparture = /^[A-Z]{4}$/.test(departure.trim());
  const validArrival = /^[A-Z]{4}$/.test(arrival.trim());
  const departures = $api.useQuery(
    "get",
    "/api/flights/by-departure/{icao}",
    { params: { path: { icao: departure.trim() } } },
    { enabled: validDeparture, retry: false },
  );
  const arrivals = $api.useQuery(
    "get",
    "/api/flights/by-arrival/{icao}",
    { params: { path: { icao: arrival.trim() } } },
    { enabled: !validDeparture && validArrival, retry: false },
  );
  const { data: mine, error: mineError } = $api.useQuery("get", "/api/flights/mine", {}, { retry: false });
  const offline = mineError?.status === 404 && mineError.type === "urn:vatprc-uniapi-error:flight-not-found-for-cid";
  const unauthenticated = mineError?.status === 401;
  const query = validDeparture ? departures : validArrival ? arrivals : undefined;
  const error = query?.error ?? (offline || unauthenticated ? undefined : mineError);
  const normalizedFilter = filter.trim().toUpperCase();
  const flights = query?.data?.filter((flight) => {
    const plan = flight.flight_plan;
    return (
      (!normalizedFilter ||
        plan.callsign.toUpperCase().includes(normalizedFilter) ||
        flight.cid.includes(normalizedFilter)) &&
      (!departure.trim() || plan.departure.toUpperCase().includes(departure.trim())) &&
      (!arrival.trim() || plan.arrival.toUpperCase().includes(arrival.trim()))
    );
  });

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">
          <Trans>Flight Plan Checker</Trans>
        </h1>
      </div>
      {error && (
        <Alert className="w-full" color="red" title={error.title}>
          {error.detail}
        </Alert>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <TextInput
          label={t`Callsign / CID`}
          placeholder={t`Callsign`}
          value={filter}
          onChange={(event) => setFilter(event.currentTarget.value.toUpperCase())}
        />
        <TextInput
          label={t`Departure`}
          placeholder="ZBAA"
          maxLength={4}
          value={departure}
          onChange={(event) => setDeparture(event.currentTarget.value.toUpperCase())}
        />
        <TextInput
          label={t`Arrival`}
          placeholder="ZSPD"
          maxLength={4}
          value={arrival}
          onChange={(event) => setArrival(event.currentTarget.value.toUpperCase())}
        />
        {/^[A-Z0-9-]+$/.test(normalizedFilter) && /[A-Z]/.test(normalizedFilter) && (
          <LinkButton to="/flights/$callsign" params={{ callsign: normalizedFilter }}>
            <Trans>Find flight</Trans>
          </LinkButton>
        )}
      </div>
      {!query && (
        <p className="text-muted-foreground">
          <Trans>Enter a departure or arrival airport ICAO code to list flights, or open a flight by callsign.</Trans>
        </p>
      )}
      {query?.isLoading && <Skeleton h={64} w="100%" aria-label={t`Loading flights`} />}
      {query?.data && flights?.length === 0 && (
        <p>
          <Trans>No results.</Trans>
        </p>
      )}
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(--spacing(64),1fr))] gap-2">
        {mine && <FlightCard flight={mine} mine />}
        {offline && (
          <div className="flex flex-col gap-1 border border-dashed px-3 py-2 text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1 text-lg font-bold">
              <TbPlaneOff />
              <Trans>Your flight is not online</Trans>
            </span>
            <span className="text-sm">
              <Trans>Connect to the VATSIM network to see your flight here.</Trans>
            </span>
          </div>
        )}
        {flights
          ?.filter((flight) => flight.flight_plan.callsign !== mine?.flight_plan.callsign)
          .map((flight) => (
            <FlightCard key={flight.flight_plan.callsign} flight={flight} />
          ))}
      </div>
    </div>
  );
}
