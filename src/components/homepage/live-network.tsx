import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Collapse, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { format, parseISO } from "date-fns";
import React from "react";
import { TbArrowRight, TbCaretUpDown } from "react-icons/tb";

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
    <span className="min-w-20 text-gray-600 dark:text-gray-400">{frequency ?? "--"}</span>
    <span className="flex-1 text-gray-500">{name}</span>
    {schedule ? (
      <span className="text-xs text-gray-500">
        {format(schedule[0], "MM-dd HHmm", { in: utc })}Z–{format(schedule[1], "HHmm", { in: utc })}Z
      </span>
    ) : (
      <span className="bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
        <Trans>Online</Trans>
      </span>
    )}
  </div>
);

const PilotStrip: React.FC<{
  callsign: string;
  aircraft?: string | null;
  departure?: string | null;
  arrival?: string | null;
}> = ({ callsign, aircraft, departure, arrival }) => (
  <div className="flex items-baseline gap-3 border-b border-gray-200 px-4 py-2 font-mono text-sm last:border-b-0 dark:border-gray-800">
    <span className="min-w-24 font-bold">{callsign}</span>
    <span className="min-w-14 text-gray-500">{aircraft}</span>
    <span className="text-gray-600 dark:text-gray-400">
      {departure}→{arrival}
    </span>
  </div>
);

export const LiveNetwork: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useLingui();
  const { data, isLoading } = $api.useQuery("get", "/api/compat/online-status");
  const [opened, { toggle }] = useDisclosure(false);

  if (isLoading) return <Loader />;

  const pilots = data?.pilots ?? [];

  return (
    <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-5", className)}>
      <section className="lg:col-span-3">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-2xl font-medium">
            <Trans>Online Controllers</Trans>
          </h3>
          <Button
            variant="subtle"
            color="red"
            component="a"
            href="/controllers"
            rightSection={<TbArrowRight size={14} />}
          >
            <Trans>ATC Center</Trans>
          </Button>
        </div>
        <div className="border border-gray-200 dark:border-gray-800">
          {(data?.controllers?.length ?? 0) === 0 && (data?.future_controllers?.length ?? 0) === 0 && (
            <p className="px-4 py-6 font-mono text-sm text-gray-500">
              <Trans>There is currently no online ATC.</Trans>
            </p>
          )}
          {data?.controllers?.map((c) => (
            <ControllerStrip key={c.callsign} callsign={c.callsign} name={c.name} frequency={c.frequency} />
          ))}
          {data?.future_controllers?.map((c) => (
            <ControllerStrip
              key={c.callsign}
              callsign={c.callsign}
              name={c.name}
              schedule={[parseISO(c.start_utc), parseISO(c.end_utc)]}
            />
          ))}
        </div>
      </section>
      <section className="lg:col-span-2">
        <h3 className="mb-4 text-2xl font-medium">
          <Trans>Online Pilots</Trans>
        </h3>
        <div className="border border-gray-200 dark:border-gray-800">
          {pilots.length === 0 && (
            <p className="px-4 py-6 font-mono text-sm text-gray-500">
              <Trans>No online pilot.</Trans>
            </p>
          )}
          {pilots.slice(0, 8).map((p) => (
            <PilotStrip key={p.callsign} {...p} />
          ))}
          <Collapse expanded={opened}>
            {pilots.slice(8).map((p) => (
              <PilotStrip key={p.callsign} {...p} />
            ))}
          </Collapse>
        </div>
        {pilots.length > 8 && (
          <Button variant="subtle" size="sm" className="mt-2" rightSection={<TbCaretUpDown />} onClick={toggle}>
            {opened ? t`Show less pilots` : t`Show all pilots`}
          </Button>
        )}
      </section>
    </div>
  );
};
