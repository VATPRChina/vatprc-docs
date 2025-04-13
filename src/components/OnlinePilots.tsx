"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { OnlineData } from "@/lib/types/online";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import useSWR from "swr";

const ONLINE_STATUS_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "/api/cors/online-status"
    : "https://uniapi.vatprc.net/api/compat/online-status";
const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

const Pilot: React.FC<{
  callsign: string;
  aircraft: string;
  departure: string;
  arrival: string;
}> = ({ callsign, aircraft, departure, arrival }) => {
  return (
    <div className="flex flex-col rounded-md border px-6 py-4 hover:bg-gray-50">
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

export const OnlinePilots: React.FC<{ className?: string }> = ({
  className,
}) => {
  const t = useTranslations("Legacy");

  const { data, isLoading } = useSWR<OnlineData>(
    ONLINE_STATUS_ENDPOINT,
    fetcher,
  );

  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <Loader className="h-24" size={48} />;
  }

  const pilots =
    data?.pilots?.map((c) => (
      <Pilot
        key={c.callsign}
        callsign={c.callsign}
        aircraft={c.aircraft}
        departure={c.departure}
        arrival={c.arrival}
      />
    )) ?? [];

  if (pilots.length <= 0) {
    return (
      <div
        className={cn(
          className,
          "flex flex-wrap justify-center gap-x-2 gap-y-4",
        )}
      >
        {(!data || data?.pilots.length === 0) && (
          <span>{t("no-pilot-online")}</span>
        )}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
      <div
        className={cn(
          className,
          "flex flex-wrap justify-center gap-x-2 gap-y-4",
        )}
      >
        {pilots?.slice(0, 8)}
      </div>
      <div className="flex items-center justify-center space-x-4 px-4">
        {open ? t("pilots-less") : t("pilots-all")}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        {" "}
        <div
          className={cn(
            className,
            "flex flex-wrap justify-center gap-x-2 gap-y-4",
          )}
        >
          {pilots?.slice(8)}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
