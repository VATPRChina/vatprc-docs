import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans } from "@lingui/react/macro";
import { Button, Loader } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import React from "react";
import { TbArrowRight } from "react-icons/tb";

const ControllerStrip: React.FC<{
  callsign: string;
  name: string;
  frequency?: string;
  schedule?: [Date, Date];
}> = ({ callsign, name, frequency, schedule }) => (
  <div
    className={cn(
      "flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-gray-200 px-4 py-3 font-mono text-sm last:border-b-0 dark:border-gray-800",
      "border-l-3",
      schedule ? "border-l-gray-300 dark:border-l-gray-700" : "border-l-emerald-600",
    )}
  >
    <span className="min-w-28 font-bold">{callsign}</span>
    <span className="min-w-20 text-gray-700 dark:text-gray-300">{frequency ?? "--"}</span>
    <span className="flex-1 text-gray-700 dark:text-gray-300">{name}</span>
    {schedule && (
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {format(schedule[0], "MM-dd HHmm", { in: utc })}Z–{format(schedule[1], "HHmm", { in: utc })}Z
      </span>
    )}
  </div>
);

export const ControllersBoard: React.FC<{ className?: string }> = ({ className }) => {
  const { data, isLoading } = $api.useQuery("get", "/api/compat/online-status");

  if (isLoading) return <Loader />;

  const online = data?.controllers ?? [];
  const booked = data?.future_controllers ?? [];

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-2xl font-medium">
          <Trans>Controllers</Trans>
        </h2>
        <Button
          variant="subtle"
          color="red"
          component={Link}
          to="/controllers"
          rightSection={<TbArrowRight size={14} />}
        >
          <Trans>ATC Center</Trans>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 font-mono text-sm text-gray-700 uppercase dark:text-gray-300">
            <Trans>Online Controllers</Trans>
          </h3>
          <div className="border border-gray-200 dark:border-gray-800">
            {online.length === 0 && (
              <p className="px-4 py-6 font-mono text-sm text-gray-600 dark:text-gray-300">
                <Trans>There is currently no online ATC.</Trans>
              </p>
            )}
            {online.map((c) => (
              <ControllerStrip key={c.callsign} callsign={c.callsign} name={c.name} frequency={c.frequency} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 font-mono text-sm text-gray-700 uppercase dark:text-gray-300">
            <Trans>Booked Controllers</Trans>
          </h3>
          <div className="border border-gray-200 dark:border-gray-800">
            {booked.length === 0 && (
              <p className="px-4 py-6 font-mono text-sm text-gray-600 dark:text-gray-300">
                <Trans>No upcoming ATC booking.</Trans>
              </p>
            )}
            {booked.map((c) => (
              <ControllerStrip
                key={`${c.callsign}-${c.start_utc}`}
                callsign={c.callsign}
                name={c.name}
                schedule={[parseISO(c.start_utc), parseISO(c.end_utc)]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
