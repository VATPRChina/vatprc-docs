import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans } from "@lingui/react/macro";
import { Loader } from "@mantine/core";
import { format, parseISO } from "date-fns";
import React from "react";

const Controller: React.FC<{
  callsign: string;
  name: string;
  schedule?: [Date, Date];
  frequency?: string;
}> = ({ callsign, name, frequency, schedule }) => {
  return (
    <div className="hover:bg-secondary flex min-w-48 flex-col gap-2 border px-6 py-4">
      <span className={cn("text-lg font-bold", schedule ? "text-blue-900" : "text-red-900")}>{callsign}</span>
      <span>{name}</span>
      {frequency && <span>{frequency}</span>}
      {schedule && (
        <div className="flex gap-1">
          <span>{format(schedule[0], "MM-dd")}</span>
          <span>
            {format(schedule[0], "HHmm", { in: utc })}
            <span className="text-sm font-light">Z</span>
          </span>
          <span>-</span>
          <span>
            {format(schedule[1], "HHmm", { in: utc })}
            <span className="text-sm font-light">Z</span>
          </span>
        </div>
      )}
    </div>
  );
};

export const OnlineControllers: React.FC<{ className?: string }> = ({ className }) => {
  const { data, isLoading } = $api.useQuery("get", "/api/compat/online-status");

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={cn(className, "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3")}>
      {(!data || data?.controllers?.length === 0) && (
        <span className="basis-full">
          <Trans>There is currently no online ATC.</Trans>
        </span>
      )}
      {data?.controllers?.map((c) => (
        <Controller key={c.callsign} callsign={c.callsign} name={c.name} frequency={c.frequency} />
      ))}
      {data?.future_controllers?.map((c) => (
        <Controller
          key={c.callsign}
          callsign={c.callsign}
          name={c.name}
          schedule={[parseISO(c.start_utc), parseISO(c.end_utc)]}
        />
      ))}
    </div>
  );
};
