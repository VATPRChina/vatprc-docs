import { m } from "@/lib/i18n/messages";
import { OnlineData } from "@/lib/types/online";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";
import { TbLoader } from "react-icons/tb";

const ONLINE_STATUS_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "/api/cors/online-status"
    : "https://uniapi.vatprc.net/api/compat/online-status";
const fetcher = () => fetch(ONLINE_STATUS_ENDPOINT).then((res) => res.json());

const Controller: React.FC<{
  callsign: string;
  name: string;
  schedule?: [Date, Date];
  frequency?: string;
}> = ({ callsign, name, frequency, schedule }) => {
  return (
    <div className="hover:bg-secondary flex min-w-48 flex-col gap-2 rounded-md border px-6 py-4 shadow-md">
      <span className={cn("text-xl font-bold", schedule ? "text-blue-900" : "text-red-900")}>{callsign}</span>
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

export const OnlineControllers: React.FC<{ className?: string }> = ({ className }) => {
  const { data, isLoading } = useQuery<OnlineData>({
    queryKey: ["https://uniapi.vatprc.net/api/compat/online-status"],
    queryFn: fetcher,
  });

  if (isLoading) {
    return <TbLoader className="m-auto h-24 animate-spin" size={48} />;
  }

  return (
    <div className={cn(className, "flex flex-wrap gap-4")}>
      {data?.controllers?.map((c) => (
        <Controller key={c.callsign} callsign={c.callsign} name={c.name} frequency={c.frequency} />
      ))}
      {data?.futureControllers?.map((c) => (
        <Controller
          key={c.callsign}
          callsign={c.callsign}
          name={c.name}
          schedule={[new Date(c.start), new Date(c.end)]}
        />
      ))}{" "}
      {(!data || data?.controllers?.length === 0) && <span>{m["Legacy_no-atc-online"]()}</span>}
    </div>
  );
};
