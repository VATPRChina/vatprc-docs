import { ScheduledEvent, useScheduledEvents } from "@/components/homepage/use-scheduled-events";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Button, Loader } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import React from "react";
import { TbArrowRight, TbChevronLeft, TbChevronRight, TbPlaneDeparture } from "react-icons/tb";

const VISIBLE_COUNT = 3;
const TILT_MAX_DEG = 8;

const BookingCount: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { data: positions } = $api.useQuery("get", "/api/events/{event_id}/controllers", {
    params: { path: { event_id: eventId } },
  });

  if (!positions) return <span className="font-mono text-sm text-gray-600 dark:text-gray-300">--</span>;
  if (positions.length === 0)
    return (
      <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
        <Trans>ATC booking not open</Trans>
      </span>
    );

  const booked = positions.filter((p) => p.booking).length;
  const total = positions.length;
  const hue = Math.round((booked / total) * 140);
  return (
    <span className="font-mono text-sm" style={{ color: `light-dark(hsl(${hue} 85% 36%), hsl(${hue} 85% 62%))` }}>
      <Trans>
        ATC booked {booked}/{total}
      </Trans>
    </span>
  );
};

const EventCard: React.FC<{ event: ScheduledEvent }> = ({ event }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${(-y * TILT_MAX_DEG).toFixed(2)}deg) rotateY(${(
      x * TILT_MAX_DEG
    ).toFixed(2)}deg) scale(1.03)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Link
      to="/events/$id"
      params={{ id: event.id }}
      className="group block"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        ref={ref}
        className="flex h-full flex-col overflow-hidden border border-gray-300 transition-[transform,box-shadow] duration-150 ease-out will-change-transform group-hover:shadow-xl group-hover:shadow-black/25 dark:border-gray-600 dark:group-hover:shadow-black/70"
      >
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-900">
            <TbPlaneDeparture size={36} />
          </div>
        )}
        <div className="flex flex-col gap-1 px-4 py-3">
          <span className="truncate font-medium">{event.title}</span>
          <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
            {format(event.start, "MM-dd HHmm", { in: utc })}Z–{format(event.end, "HHmm", { in: utc })}Z
          </span>
          <BookingCount eventId={event.id} />
        </div>
      </div>
    </Link>
  );
};

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
        <Button
          variant="subtle"
          color="red"
          className="shrink-0 whitespace-nowrap"
          component={Link}
          to="/events"
          rightSection={<TbArrowRight size={14} />}
        >
          <Trans>See All Events</Trans>
        </Button>
      </div>
      <div className="flex items-stretch gap-3">
        <ActionIcon
          variant="default"
          size="xl"
          className="self-stretch"
          style={{ height: "auto" }}
          aria-label={t`Previous events`}
          disabled={current === 0}
          onClick={() => setStart(Math.max(0, current - 1))}
        >
          <TbChevronLeft size={24} />
        </ActionIcon>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
        <ActionIcon
          variant="default"
          size="xl"
          className="self-stretch"
          style={{ height: "auto" }}
          aria-label={t`Next events`}
          disabled={current >= maxStart}
          onClick={() => setStart(Math.min(maxStart, current + 1))}
        >
          <TbChevronRight size={24} />
        </ActionIcon>
      </div>
    </section>
  );
};
