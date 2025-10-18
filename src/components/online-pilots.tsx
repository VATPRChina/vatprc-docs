import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import React, { useState } from "react";
import { TbCaretUpDown } from "react-icons/tb";

const Pilot: React.FC<{
  callsign: string;
  aircraft: string | null | undefined;
  departure: string | null | undefined;
  arrival: string | null | undefined;
}> = ({ callsign, aircraft, departure, arrival }) => {
  return (
    <div className="hover:bg-secondary flex flex-col border px-6 py-4">
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
  const { t } = useLingui();

  const { data, isLoading } = $api.useQuery("get", "/api/compat/online-status");

  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <Spinner />;
  }

  const pilots =
    data?.pilots?.map((c) => (
      <Pilot key={c.callsign} callsign={c.callsign} aircraft={c.aircraft} departure={c.departure} arrival={c.arrival} />
    )) ?? [];

  if (pilots.length <= 0) {
    return (
      (!data || data?.pilots?.length === 0) && (
        <div className={cn("flex flex-wrap justify-center gap-x-2 gap-y-4")}>
          {(!data || data?.pilots?.length === 0) && (
            <span>
              <Trans>No online pilot.</Trans>
            </span>
          )}
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
            {open ? t`Show less pilots` : t`Show all pilots`}
            <TbCaretUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
    </Collapsible>
  );
};
