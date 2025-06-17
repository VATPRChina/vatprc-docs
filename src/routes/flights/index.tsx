import { LinkButton } from "@/components/ui/button-link";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { $api } from "@/lib/client";
import { m } from "@/lib/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ChangeEventHandler, useState } from "react";

export const Route = createFileRoute("/flights/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: flights } = $api.useQuery("get", "/api/flights/active");

  const [hidden, setHidden] = useState(true);
  const [callsign, setCallsign] = useState("");
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setCallsign(e.target.value);
  };
  return (
    <div className="flex flex-col items-start gap-8">
      <h1 className="text-3xl">{m.flight_plan_checker()}</h1>
      <div className="flex flex-row gap-4">
        <Command className="w-72 rounded-lg border" onChange={onChange}>
          <CommandInput placeholder={m["flight.type_callsign"]()} value={callsign} onFocus={() => setHidden(false)} />
          <CommandList hidden={hidden}>
            <CommandEmpty>{m["flight.no_active_flght"]()}</CommandEmpty>
            <CommandGroup>
              {flights?.map((flight) => (
                <CommandItem key={flight.callsign} onSelect={() => setCallsign(flight.callsign)}>
                  {flight.callsign}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <LinkButton to="/flights/$callsign" params={{ callsign }}>
          {m.flight_plan_checker_check()}
        </LinkButton>
      </div>
    </div>
  );
}
