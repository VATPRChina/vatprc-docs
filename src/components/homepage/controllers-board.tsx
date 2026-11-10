import { DateTime } from "../event/datetime";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Skeleton } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { parseISO } from "date-fns";
import React from "react";
import { TbArrowRight } from "react-icons/tb";

const ControllerStrip: React.FC<{
  callsign: string;
  name: string;
  frequency?: string;
  eventTitle?: string;
  schedule?: [Date, Date];
}> = ({ callsign, name, frequency, eventTitle, schedule }) => (
  <div
    className={cn(
      "flex flex-col gap-1 border-l-2 p-4",
      schedule ? "border-l-gray-300 dark:border-l-gray-600" : "border-l-emerald-600 dark:border-l-emerald-400",
    )}
  >
    <p className="space-x-2">
      <span className="font-mono font-bold">{callsign}</span>
      {frequency && <span className="underline underline-offset-4">{frequency}</span>}
      <span>{name}</span>
    </p>
    {schedule && eventTitle && <p className="text-dimmed">{schedule && eventTitle}</p>}
    {schedule && (
      <div className="flex items-center gap-1 text-sm">
        <DateTime>{schedule[0]}</DateTime>
        <TbArrowRight size={12} />
        <DateTime>{schedule[1]}</DateTime>
      </div>
    )}
  </div>
);

interface StripListProps {
  children: React.ReactElement[];
  empty: React.ReactNode;
  isLoading?: boolean;
}

const StripList: React.FC<StripListProps> = ({ children, empty, isLoading }) => {
  return (
    <div className="divide-y border border-black/15 dark:border-white/20">
      {isLoading &&
        Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border-b border-black/15 px-4 py-3 last:border-b-0 dark:border-white/20">
              <Skeleton width="100%" height={24} />
            </div>
          ))}
      {!isLoading && children.length === 0 && (
        <p className="px-4 py-6 font-mono text-base text-gray-600 dark:text-gray-300">{empty}</p>
      )}
      {children}
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
          <StripList empty={<Trans>There is currently no online ATC.</Trans>} isLoading={isLoading}>
            {online.map((c) => (
              <ControllerStrip key={c.callsign} callsign={c.callsign} name={c.name} frequency={c.frequency} />
            ))}
          </StripList>
        </div>
        <div>
          <h3 className="mb-1 font-mono text-base text-gray-700 uppercase dark:text-gray-300">
            <Trans>Booked Controllers</Trans>
          </h3>
          <StripList empty={<Trans>No upcoming ATC booking.</Trans>} isLoading={areBookingsLoading}>
            {booked.map((c) => {
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
          </StripList>
        </div>
      </div>
    </section>
  );
};
