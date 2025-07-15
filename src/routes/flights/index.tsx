import { LinkButton } from "@/components/ui/button-link";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { $api } from "@/lib/client";
import { createFileRoute } from "@tanstack/react-router";
import { ChangeEventHandler, useState } from "react";

export const Route = createFileRoute("/flights/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: `Flight Plan Checker` }],
  }),
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
      <h1 className="text-3xl">Flight Plan Checker</h1>
      <div className="flex flex-row gap-4">
        <Command className="w-72 rounded-lg border" onChange={onChange}>
          <CommandInput placeholder="Callsign" value={callsign} onFocus={() => setHidden(false)} />
          <CommandList hidden={hidden}>
            <CommandEmpty>No active flight</CommandEmpty>
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
          Check
        </LinkButton>
      </div>
    </div>
  );
}
