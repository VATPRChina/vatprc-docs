import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { m } from "@/lib/i18n/messages";
import { OnlineData } from "@/lib/types/online";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { TbCaretUpDown, TbLoader } from "react-icons/tb";

const ONLINE_STATUS_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "/api/cors/online-status"
    : "https://uniapi.vatprc.net/api/compat/online-status";
const fetcher = () => fetch(ONLINE_STATUS_ENDPOINT).then((res) => res.json());

const Pilot: React.FC<{
  callsign: string;
  aircraft: string;
  departure: string;
  arrival: string;
}> = ({ callsign, aircraft, departure, arrival }) => {
  return (
    <div className="hover:bg-secondary flex flex-col rounded-md border px-6 py-4">
      <div className="flex gap-2">
        <span className="font-bold">{callsign}</span>
        <span className="font-light text-gray-500">{aircraft}</span>
      </div>
      <div className="flex gap-1">
        <span>{departure}</span>
        <span>-</span>
        <span>{arrival}</span>
      </div>
    </div>
  );
};

export const OnlinePilots: React.FC<{ className?: string }> = ({ className }) => {
  const { data, isLoading } = useQuery<OnlineData>({ queryKey: [ONLINE_STATUS_ENDPOINT], queryFn: fetcher });

  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <TbLoader className="m-auto h-24 animate-spin" size={48} />;
  }

  const pilots =
    data?.pilots?.map((c) => (
      <Pilot key={c.callsign} callsign={c.callsign} aircraft={c.aircraft} departure={c.departure} arrival={c.arrival} />
    )) ?? [];

  if (pilots.length <= 0) {
    return (
      (!data || data?.pilots?.length === 0) && (
        <div className={cn("flex flex-wrap justify-center gap-x-2 gap-y-4")}>
          {(!data || data?.pilots?.length === 0) && <span>{m["Components_OnlinePilots_no_pilot"]()}</span>}
        </div>
      )
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
      <div className={cn(className, "flex flex-wrap justify-center gap-x-2 gap-y-2")}>{pilots?.slice(0, 8)}</div>
      <CollapsibleContent asChild>
        <div className={cn(className, "mt-2 flex flex-wrap justify-center gap-x-2 gap-y-2")}>{pilots?.slice(8)}</div>
      </CollapsibleContent>
      <div className="mt-2 flex items-center justify-center space-x-4 px-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {open ? m["Legacy_pilots-less"]() : m["Legacy_pilots-all"]()}
            <TbCaretUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
    </Collapsible>
  );
};
