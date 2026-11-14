import { Card, CardContent } from "../ui/card";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { format, isSameWeek, parseISO } from "date-fns";
import React from "react";
import { TbArrowRight, TbPlaneDeparture } from "react-icons/tb";

type EventDto = components["schemas"]["EventDto"];

const BookingCount: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { data: positions, error } = $api.useQuery("get", "/api/events/{event_id}/controllers", {
    params: { path: { event_id: eventId } },
  });

  if (error) {
    return (
      <Alert variant={"destructive"}>
        <AlertTitle>{error.title}</AlertTitle>
        <AlertDescription>{error.detail}</AlertDescription>
      </Alert>
    );
  }
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
  const start = parseISO(event.start_at);
  const end = parseISO(event.end_at);
  const title = i18n.locale === "en" ? (event.title_en ?? event.title) : event.title;
  const thisWeek = isSameWeek(start, Date.now(), { weekStartsOn: 1 });

  return (
    <Link
      to="/events/$id"
      params={{ id: event.id }}
      className="group relative z-0 block h-full hover:z-20 focus-visible:z-20"
    >
      <Card className="overflow-hidden pt-0" size="sm">
        {event.image_url ? (
          <img src={event.image_url} alt={title} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-900">
            <TbPlaneDeparture size={36} />
          </div>
        )}
        <CardContent className="flex flex-col gap-2">
          <span className="truncate text-lg font-medium">{title}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base text-gray-700 dark:text-gray-300">
              {format(start, "MM-dd HHmm", { in: utc })}Z–{format(end, "HHmm", { in: utc })}Z
            </span>
            {thisWeek && (
              <Badge>
                <Trans>This Week</Trans>
              </Badge>
            )}
          </div>
          <BookingCount eventId={event.id} />
        </CardContent>
      </Card>
    </Link>
  );
};

export const EventCarousel: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useLingui();
  const { data: events, error, isLoading } = $api.useQuery("get", "/api/events");

  const upcoming = events?.filter((e) => !e.title.includes("考试")) ?? [];

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-2xl font-medium">
          <Trans>Recent Events</Trans>
        </h2>
        <LinkButton className="shrink-0 whitespace-nowrap" to="/events" variant={"neutral"}>
          <Trans>See All Events</Trans>
          {<TbArrowRight size={14} />}
        </LinkButton>
      </div>
      {isLoading && (
        <div className="flex flex-row gap-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton className="h-24" key={i} style={{ width: "100%" }} />
            ))}
        </div>
      )}
      {error && (
        <Alert variant={"destructive"}>
          <AlertDescription>
            <Trans>Failed to load events.</Trans>
          </AlertDescription>
        </Alert>
      )}
      {!isLoading && !error && upcoming.length === 0 && (
        <p>
          <Trans>There is no upcoming events.</Trans>
        </p>
      )}
      {!isLoading && !error && upcoming.length > 0 && (
        <Carousel opts={{ align: "start" }}>
          <CarouselContent>
            {upcoming.map((e) => (
              <CarouselItem key={e.id} className="sm:basis-1/2 lg:basis-1/3">
                <EventCard event={e} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label={t`Previous events`} />
          <CarouselNext aria-label={t`Next events`} />
        </Carousel>
      )}
    </section>
  );
};
