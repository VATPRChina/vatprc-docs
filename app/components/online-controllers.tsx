import { $api } from "@/lib/client";
import { m } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { format, parse } from "date-fns";
import React from "react";
import { TbLoader } from "react-icons/tb";

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
  const { data, isLoading } = $api.useQuery("get", "/api/compat/online-status");

  if (isLoading) {
    return <TbLoader className="m-auto h-24 animate-spin" size={48} />;
  }

  return (
    <div className={cn(className, "flex flex-wrap gap-4")}>
      {data?.controllers?.map((c) => (
        <Controller key={c.callsign} callsign={c.callsign} name={c.name} frequency={c.frequency} />
      ))}
      {data?.future_controllers?.map((c) => (
        <Controller
          key={c.callsign}
          callsign={c.callsign}
          name={c.name}
          schedule={[
            parse(c.start, "dd HH:mm", Date.now(), { in: utc }),
            parse(c.end, "dd HH:mm", Date.now(), { in: utc }),
          ]}
        />
      ))}
      {(!data || data?.controllers?.length === 0) && <span>{m["Legacy_no-atc-online"]()}</span>}
    </div>
  );
};
