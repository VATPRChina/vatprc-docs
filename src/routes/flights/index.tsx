import { Input } from "@/components/ui/input";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ChangeEventHandler, useState } from "react";
import * as React from "react";

export const Route = createFileRoute("/flights/")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Flight Plan Checker`) }],
  }),
});

const Flight: React.FC<{
  flight: components["schemas"]["FlightDto"];
}> = ({ flight: { callsign, cid, departure, arrival, aircraft } }) => (
  <Link to="/flights/$callsign" params={{ callsign }} key={callsign} className="flex flex-col gap-1 border px-3 py-2">
    <span className="text-lg font-bold">
      {callsign}
      <span className="ml-1 text-sm font-light">{cid}</span>
    </span>
    <div className="flex items-center gap-x-1">
      <span>{departure}</span>
      <span className="mx-2 font-mono text-xs font-light text-gray-400">{aircraft}</span>
      <span>{arrival}</span>
    </div>
  </Link>
);

function RouteComponent() {
  const { t } = useLingui();

  const { data: flights } = $api.useQuery("get", "/api/flights/active");
  const { data: mine } = $api.useQuery("get", "/api/flights/mine");

  const [filter, setFilter] = useState("");
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFilter(e.target.value);
  };
  return (
    <div className="flex flex-col items-start gap-8">
      <h1 className="text-3xl">
        <Trans>Flight Plan Checker</Trans>
      </h1>
      <div className="flex flex-row gap-4">
        <Input placeholder={t`Callsign`} value={filter} onChange={onChange} />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fill,_minmax(calc(var(--spacing)*64),_1fr))] gap-x-6 gap-y-4">
        {mine && <Flight flight={mine} />}
        {flights
          ?.filter((f) => f.callsign.includes(filter) || f.cid.includes(filter))
          ?.map((flight) => (
            <Flight flight={flight} key={flight.callsign} />
          ))}
        <Outlet />
      </div>
    </div>
  );
}
