import { ScheduledEvent, useScheduledEvents } from "@/components/homepage/use-scheduled-events";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, ActionIconGroup, Anchor, Loader } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import React from "react";
import { TbChevronLeft, TbChevronRight, TbPlaneDeparture } from "react-icons/tb";

const VISIBLE_COUNT = 3;

const BookingCount: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { data: positions } = $api.useQuery("get", "/api/events/{event_id}/controllers", {
    params: { path: { event_id: eventId } },
  });

  if (!positions) return <span className="font-mono text-sm text-gray-500">--</span>;
  if (positions.length === 0)
    return (
      <span className="font-mono text-sm text-gray-500">
        <Trans>ATC booking not open</Trans>
      </span>
    );

  const booked = positions.filter((p) => p.booking).length;
  const total = positions.length;
  const short = booked / total < 0.5;
  return (
    <span className={cn("font-mono text-sm", short ? "text-vatprc dark:text-vatprc-bright" : "text-gray-500")}>
      <Trans>
        ATC booked {booked}/{total}
      </Trans>
    </span>
  );
};

const EventCard: React.FC<{ event: ScheduledEvent }> = ({ event }) => (
  <Link
    to="/events/$id"
    params={{ id: event.id }}
    className="group flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800"
  >
    {event.imageUrl ? (
      <img
        src={event.imageUrl}
        alt={event.title}
        className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
      />
    ) : (
      <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-900">
        <TbPlaneDeparture size={36} />
      </div>
    )}
    <div className="flex flex-col gap-1 px-4 py-3">
      <span className="truncate font-medium">{event.title}</span>
      <BookingCount eventId={event.id} />
    </div>
  </Link>
);

export const EventCarousel: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useLingui();
  const { scheduledEvents, isLoading } = useScheduledEvents();
  const [start, setStart] = React.useState(0);

  if (isLoading) return <Loader />;

  const upcoming = scheduledEvents.filter((e) => !e.isExam);
  if (upcoming.length === 0) return null;

  const maxStart = Math.max(0, upcoming.length - VISIBLE_COUNT);
  const current = Math.min(start, maxStart);
  const visible = upcoming.slice(current, current + VISIBLE_COUNT);

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-2xl font-medium">
          <Trans>Recent Events</Trans>
        </h2>
        <div className="flex items-center gap-4">
          <Anchor renderRoot={(props) => <Link to="/events" {...props} />}>
            <Trans>See All Events</Trans>
          </Anchor>
          <ActionIconGroup>
            <ActionIcon
              variant="default"
              aria-label={t`Previous events`}
              disabled={current === 0}
              onClick={() => setStart(Math.max(0, current - 1))}
            >
              <TbChevronLeft />
            </ActionIcon>
            <ActionIcon
              variant="default"
              aria-label={t`Next events`}
              disabled={current >= maxStart}
              onClick={() => setStart(Math.min(maxStart, current + 1))}
            >
              <TbChevronRight />
            </ActionIcon>
          </ActionIconGroup>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
};
