import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { getEventTitle } from "@/lib/event";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Carousel } from "@mantine/carousel";
import { Button, Loader } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { format, isSameWeek, parseISO } from "date-fns";
import React from "react";
import { TbArrowRight, TbPlaneDeparture } from "react-icons/tb";

type EventDto = components["schemas"]["EventDto"];

const TILT_MAX_DEG = 8;

const BookingCount: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { data: positions } = $api.useQuery("get", "/api/events/{event_id}/controllers", {
    params: { path: { event_id: eventId } },
  });

  if (!positions) return <span className="font-mono text-base text-gray-600 dark:text-gray-300">--</span>;
  if (positions.length === 0)
    return (
      <span className="font-mono text-base text-gray-600 dark:text-gray-300">
        <Trans>ATC booking not open</Trans>
      </span>
    );

  const booked = positions.filter((p) => p.booking).length;
  const total = positions.length;
  const hue = Math.round((booked / total) * 140);
  return (
    <span className="font-mono text-base" style={{ color: `light-dark(hsl(${hue} 85% 36%), hsl(${hue} 85% 62%))` }}>
      <Trans>
        ATC booked {booked}/{total}
      </Trans>
    </span>
  );
};

const EventCard: React.FC<{ event: EventDto }> = ({ event }) => {
  const { i18n } = useLingui();
  const ref = React.useRef<HTMLDivElement>(null);
  const start = parseISO(event.start_at);
  const end = parseISO(event.end_at);
  const title = getEventTitle(event, i18n.locale);
  const thisWeek = isSameWeek(start, Date.now(), { weekStartsOn: 1 });

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
      className="group block h-full"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        ref={ref}
        className={cn(
          "flex h-full flex-col overflow-hidden border transition-[transform,box-shadow] duration-150 ease-out will-change-transform group-hover:shadow-xl group-hover:shadow-black/25 dark:group-hover:shadow-black/70",
          thisWeek ? "border-2 border-emerald-600 dark:border-emerald-400" : "border-gray-300 dark:border-gray-600",
        )}
      >
        {event.image_url ? (
          <img src={event.image_url} alt={title} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-900">
            <TbPlaneDeparture size={36} />
          </div>
        )}
        <div className="flex flex-col gap-1 px-4 py-3">
          <span className="truncate text-lg font-medium">{title}</span>
          <span className="font-mono text-base text-gray-700 dark:text-gray-300">
            {format(start, "MM-dd HHmm", { in: utc })}Z–{format(end, "HHmm", { in: utc })}Z
          </span>
          <BookingCount eventId={event.id} />
        </div>
      </div>
    </Link>
  );
};

export const EventCarousel: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useLingui();
  const { data: events, isLoading } = $api.useQuery("get", "/api/events");

  if (isLoading) return <Loader />;

  const upcoming = events?.filter((e) => !e.title.includes("考试")) ?? [];
  if (upcoming.length === 0) return null;

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
      <Carousel
        slideSize={{ base: "100%", sm: "50%", lg: "33.333333%" }}
        slideGap="md"
        controlSize={40}
        controlsOffset={0}
        emblaOptions={{ align: "start" }}
        previousControlProps={{ "aria-label": t`Previous events` }}
        nextControlProps={{ "aria-label": t`Next events` }}
        classNames={{ slide: "py-1" }}
      >
        {upcoming.map((e) => (
          <Carousel.Slide key={e.id}>
            <EventCard event={e} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </section>
  );
};
