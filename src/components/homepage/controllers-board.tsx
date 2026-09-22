import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Skeleton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import React from "react";
import { TbArrowRight, TbChevronDown, TbChevronUp } from "react-icons/tb";

const MAX_VISIBLE_STRIPS = 5;

const ControllerStrip: React.FC<{
  callsign: string;
  name: string;
  frequency?: string;
  eventTitle?: string;
  schedule?: [Date, Date];
}> = ({ callsign, name, frequency, eventTitle, schedule }) => (
  <div
    className={cn(
      "flex flex-wrap items-baseline gap-1 border-b border-black/15 px-4 py-3 font-mono text-base last:border-b-0 dark:border-white/20",
      "border-l-3",
      schedule ? "border-l-gray-300 dark:border-l-gray-600" : "border-l-emerald-600 dark:border-l-emerald-400",
    )}
  >
    <span className="min-w-28 font-bold">{callsign}</span>
    <span className="min-w-20 truncate text-gray-700 dark:text-gray-300">
      {(schedule ? eventTitle : frequency) ?? "--"}
    </span>
    <span className="flex-1 text-gray-700 dark:text-gray-300">{name}</span>
    {schedule && (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {format(schedule[0], "MM-dd HHmm", { in: utc })}Z–{format(schedule[1], "HHmm", { in: utc })}Z
      </span>
    )}
  </div>
);

interface StripListProps {
  strips: React.ReactElement[];
  empty: React.ReactNode;
  isLoading?: boolean;
}
const StripList: React.FC<StripListProps> = ({ strips, empty, isLoading }) => {
  const { t } = useLingui();
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <div className="border border-black/15 dark:border-white/20">
      {isLoading && (
        <>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border-b border-black/15 px-4 py-3 last:border-b-0 dark:border-white/20">
                <Skeleton width="100%" height={24} />
              </div>
            ))}
        </>
      )}
      {!isLoading && strips.length === 0 && (
        <p className="px-4 py-6 font-mono text-base text-gray-600 dark:text-gray-300">{empty}</p>
      )}
      {!isLoading && strips.slice(0, MAX_VISIBLE_STRIPS)}
      {strips.length > MAX_VISIBLE_STRIPS && (
        <>
          {opened && strips.slice(MAX_VISIBLE_STRIPS)}
          <button
            type="button"
            aria-label={opened ? t`Show fewer controllers` : t`Show all controllers`}
            aria-expanded={opened}
            onClick={toggle}
            className="flex w-full items-center justify-center border-t border-black/15 py-1.5 text-gray-600 hover:bg-gray-50 dark:border-white/20 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            {opened ? <TbChevronUp size={20} /> : <TbChevronDown size={20} />}
          </button>
        </>
      )}
    </div>
  );
};

export const ControllersBoard: React.FC<{ className?: string }> = ({ className }) => {
  const { data, error, isLoading } = $api.useQuery("get", "/api/compat/online-status");
  const {
    data: bookings,
    error: bookingsError,
    isLoading: areBookingsLoading,
  } = $api.useQuery("get", "/api/atc/bookings/upcoming");
  const { i18n } = useLingui();

  const online = data?.controllers ?? [];
  const booked = [...(bookings ?? [])].sort((a, b) => +parseISO(a.start_at) - +parseISO(b.start_at));

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between">
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
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {(error ?? bookingsError) && (
          <Alert color="red" className="lg:col-span-2">
            <Trans>Failed to load controller information.</Trans>
          </Alert>
        )}
        <div>
          <h3 className="mb-1 font-mono text-base text-gray-700 uppercase dark:text-gray-300">
            <Trans>Online Controllers</Trans>
          </h3>
          <StripList
            empty={<Trans>There is currently no online ATC.</Trans>}
            isLoading={isLoading}
            strips={online.map((c) => (
              <ControllerStrip key={c.callsign} callsign={c.callsign} name={c.name} frequency={c.frequency} />
            ))}
          />
        </div>
        <div>
          <h3 className="mb-1 font-mono text-base text-gray-700 uppercase dark:text-gray-300">
            <Trans>Booked Controllers</Trans>
          </h3>
          <StripList
            empty={<Trans>No upcoming ATC booking.</Trans>}
            isLoading={areBookingsLoading}
            strips={booked.map((c) => {
              const schedule: [Date, Date] = [parseISO(c.start_at), parseISO(c.end_at)];
              const event = c.event_position?.event;
              const eventTitle = event && (i18n.locale === "en" ? (event.title_en ?? event.title) : event.title);
              return (
                <ControllerStrip
                  key={c.id}
                  callsign={c.callsign}
                  name={c.user.full_name}
                  eventTitle={eventTitle ?? c.remarks ?? undefined}
                  schedule={schedule}
                />
              );
            })}
          />
        </div>
      </div>
    </section>
  );
};
