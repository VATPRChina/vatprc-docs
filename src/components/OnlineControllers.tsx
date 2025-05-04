"use client";

import { OnlineData } from "@/lib/types/online";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import useSWR from "swr";

const ONLINE_STATUS_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "/api/cors/online-status"
    : "https://uniapi.vatprc.net/api/compat/online-status";
const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

const Controller: React.FC<{
  callsign: string;
  name: string;
  schedule?: [Date, Date];
  frequency?: string;
}> = ({ callsign, name, frequency, schedule }) => {
  return (
    <div className="flex min-w-48 flex-col gap-2 rounded-md border px-6 py-4 shadow-md hover:bg-gray-50">
      <span
        className={cn(
          "text-xl font-bold",
          schedule ? "text-blue-900" : "text-red-900",
        )}
      >
        {callsign}
      </span>
      <span>{name}</span>
      {frequency && <span>{frequency}</span>}
      {schedule && (
        <div className="flex gap-1">
          <span>{format(schedule[0], "MM-dd")}</span>
          <span>
            {format(schedule[0], "HHmm")}
            <span className="text-sm font-light">L</span>
          </span>
          <span>-</span>
          <span>
            {format(schedule[1], "HHmm")}
            <span className="text-sm font-light">L</span>
          </span>
        </div>
      )}
    </div>
  );
};

export const OnlineControllers: React.FC<{ className?: string }> = ({
  className,
}) => {
  const t = useTranslations("Legacy");

  const { data, isLoading } = useSWR<OnlineData>(
    ONLINE_STATUS_ENDPOINT,
    fetcher,
  );

  if (isLoading) {
    return <Loader className="m-auto h-24 animate-spin" size={48} />;
  }

  return (
    <div className={cn(className, "flex flex-wrap gap-4")}>
      {data?.controllers?.map((c) => (
        <Controller
          key={c.callsign}
          callsign={c.callsign}
          name={c.name}
          frequency={c.frequency}
        />
      ))}
      {data?.futureControllers?.map((c) => (
        <Controller
          key={c.callsign}
          callsign={c.callsign}
          name={c.name}
          schedule={[new Date(c.start), new Date(c.end)]}
        />
      ))}
      {(!data || data?.controllers.length === 0) && (
        <span>{t("no-atc-online")}</span>
      )}
    </div>
  );
};
