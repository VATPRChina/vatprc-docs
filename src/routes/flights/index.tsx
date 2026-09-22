import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Input } from "@mantine/core";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ChangeEventHandler, useMemo, useState } from "react";
import * as React from "react";
import { TbPlaneOff } from "react-icons/tb";

export const Route = createFileRoute("/flights/")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Flight Plan Checker`) }],
  }),
});

const Flight: React.FC<{
  flight: components["schemas"]["FlightDto"];
}> = ({ flight: { callsign, cid, departure, arrival, aircraft } }) => (
  <Link
    to="/flights/$callsign"
    params={{ callsign }}
    key={callsign}
    className="flex flex-col gap-1 border px-3 py-2"
    target="_blank"
  >
    <span className="text-lg font-bold">
      {callsign}
      <span className="ml-1 text-sm font-light">{cid}</span>
    </span>
    <div className="flex items-center gap-1">
      <span>{departure}</span>
      <span className="mx-1 font-mono text-xs font-light text-gray-400">{aircraft}</span>
      <span>{arrival}</span>
    </div>
  </Link>
);

const OfflineFlight = () => (
  <div className="flex flex-col gap-1 border border-dashed px-3 py-2 text-gray-600 dark:text-gray-400">
    <span className="flex items-center gap-1 text-lg font-bold">
      <TbPlaneOff />
      <Trans>Your flight is not online</Trans>
    </span>
    <span className="text-sm">
      <Trans>Connect to the VATSIM network to see your flight here.</Trans>
    </span>
  </div>
);

function RouteComponent() {
  const { t } = useLingui();

  const { data: flights, error } = $api.useQuery("get", "/api/flights/active");
  const { data: mine, error: mineError } = $api.useQuery("get", "/api/flights/mine");
  const isCurrentUserOffline =
    mineError?.type === "urn:vatprc-uniapi-error:flight-not-found-for-cid" && mineError.status === 404;
  const visibleError = error ?? (isCurrentUserOffline ? undefined : mineError);

  const [filter, setFilter] = useState("");
  const [departureFilter, setDepartureFilter] = useState("");
  const [arrivalFilter, setArrivalFilter] = useState("");

  const normalizedFilter = filter.trim().toUpperCase();
  const normalizedDepartureFilter = departureFilter.trim().toUpperCase();
  const normalizedArrivalFilter = arrivalFilter.trim().toUpperCase();
  const filteredFlights = useMemo(
    () =>
      flights?.filter((flight) => {
        const matchesCallsignOrCid =
          normalizedFilter === "" ||
          flight.callsign.toUpperCase().includes(normalizedFilter) ||
          flight.cid.toUpperCase().includes(normalizedFilter);
        const matchesDeparture =
          normalizedDepartureFilter === "" || flight.departure.toUpperCase().includes(normalizedDepartureFilter);
        const matchesArrival =
          normalizedArrivalFilter === "" || flight.arrival.toUpperCase().includes(normalizedArrivalFilter);

        return matchesCallsignOrCid && matchesDeparture && matchesArrival;
      }),
    [flights, normalizedArrivalFilter, normalizedDepartureFilter, normalizedFilter],
  );

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFilter(e.target.value);
  };
  const onDepartureFilterChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setDepartureFilter(e.target.value);
  };
  const onArrivalFilterChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setArrivalFilter(e.target.value);
  };
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-3xl">
        <Trans>Flight Plan Checker</Trans>
      </h1>
      {visibleError && (
        <Alert className="w-full" color="red" title={visibleError.title}>
          {visibleError.detail}
        </Alert>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        <Input placeholder={t`Callsign`} value={filter} onChange={onChange} />
        <Input placeholder={t`Departure`} value={departureFilter} onChange={onDepartureFilterChange} />
        <Input placeholder={t`Arrival`} value={arrivalFilter} onChange={onArrivalFilterChange} />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(calc(var(--spacing)*64),1fr))] gap-2">
        {mine && <Flight flight={mine} />}
        {isCurrentUserOffline && <OfflineFlight />}
        {filteredFlights?.map((flight) => (
          <Flight flight={flight} key={flight.callsign} />
        ))}
        <Outlet />
      </div>
    </div>
  );
}
