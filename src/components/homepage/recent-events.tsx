import { getLocale } from "@/lib/i18n";
import { CommunityEventData } from "@/lib/types/community";
import { VatsimEventData } from "@/lib/types/vatsim";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans } from "@lingui/react/macro";
import { Anchor, Button, Card, Loader } from "@mantine/core";
import { ActionIcon, ActionIconGroup } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  add,
  differenceInCalendarDays,
  endOfMonth,
  format,
  intlFormat,
  intlFormatDistance,
  isAfter,
  isMonday,
  isSameDay,
  isSameMonth,
  isSameWeek,
  nextMonday,
  previousMonday,
  startOfMonth,
  sub,
} from "date-fns";
import React, { FC } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

const COMMUNITY_EVENT_ENDPOINT = `${process.env.NODE_ENV === "development" ? "/community" : "https://community.vatprc.net"}/discourse-post-event/events.json?category_id=66&include_subcategories=true&include_expired=true`;
const VATSIM_EVENT_ENDPOINT = `${import.meta.env.VITE_API_ENDPOINT}/api/compat/homepage/events/vatsim`;

const isChinaAirport = (ident: string) =>
  ident[0] == "Z" &&
  (ident[1] == "B" ||
    ident[1] == "M" ||
    ident[1] == "S" ||
    ident[1] == "P" ||
    ident[1] == "G" ||
    ident[1] == "J" ||
    ident[1] == "Y" ||
    ident[1] == "W" ||
    ident[1] == "L" ||
    ident[1] == "H");

const Event: React.FC<{
  title: string;
  start: Date;
  end: Date;
  url: string;
  isExam: boolean;
}> = ({ title, start, end, url, isExam }) => {
  const locale = getLocale();

  return (
    <Card
      component="a"
      className="flex min-w-48 flex-col gap-2 hover:bg-gray-200"
      withBorder
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span
        className={cn(
          "text-lg font-bold",
          isExam ? "text-blue-900 dark:text-blue-100" : "text-red-900 dark:text-red-100",
        )}
      >
        {title}
      </span>
      <span>
        {intlFormatDistance(start, Date.now(), { locale })}
        {isSameWeek(start, Date.now(), { weekStartsOn: 1 }) && (
          <span className="ml-2 bg-red-200 px-1 py-0.5 dark:bg-red-800">
            <Trans>In This Week</Trans>
          </span>
        )}
      </span>
      <div className="flex gap-1 text-sm">
        <span>{format(start, "MM-dd", { in: utc })}</span>
        <span>
          {format(start, "HHmm", { in: utc })}
          <span className="text-xs font-light">Z</span>
        </span>
        <span>-</span>
        <span>
          {format(end, "HHmm", { in: utc })}
          <span className="text-xs font-light">Z</span>
        </span>
      </div>
      <div className="flex gap-1 text-sm">
        <span>{format(start, "MM-dd")}</span>
        <span>
          {format(start, "HHmm")}
          <span className="text-xs font-light">L</span>
        </span>
        <span>-</span>
        <span>
          {format(end, "HHmm")}
          <span className="text-xs font-light">L</span>
        </span>
      </div>
    </Card>
  );
};

interface Event {
  id: number;
  start: Date;
  end: Date;
  url: string;
  title: string;
  isExam: boolean;
}

export const EventList: FC<{ events: Event[]; direction: "col" | "row" }> = ({ events, direction }) => {
  return (
    <div
      className={cn(
        "gap-2",
        direction === "col" && "flex flex-col items-stretch",
        direction === "row" && "flex flex-row flex-wrap",
      )}
    >
      {events.map((e) => (
        <Event key={e.id} title={e.title} url={e.url} start={e.start} end={e.end} isExam={e.isExam} />
      ))}
      {events.length === 0 && (
        <span>
          <Trans>No event is scheduled recently.</Trans>
        </span>
      )}
    </div>
  );
};

export const EventCalendar: FC<{ events: Event[] }> = ({ events }) => {
  const locale = getLocale();
  const [refDate, setRefDate] = React.useState<Date>(new Date());

  return (
    <>
      <div className="my-6 flex items-center justify-between">
        <h4 className="text-3xl">{intlFormat(refDate, { year: "numeric", month: "long" }, { locale })}</h4>
        <div>
          <ActionIconGroup>
            <ActionIcon variant="subtle" onClick={() => setRefDate(sub(refDate, { months: 1 }))}>
              <TbChevronLeft />
            </ActionIcon>
            <ActionIcon variant="subtle" onClick={() => setRefDate(add(refDate, { months: 1 }))}>
              <TbChevronRight />
            </ActionIcon>
          </ActionIconGroup>
        </div>
      </div>
      <div className="grid grid-cols-7 items-center justify-items-center gap-4">
        <div className="contents font-bold">
          <span>
            <Trans>Mon</Trans>
          </span>
          <span>
            <Trans>Tue</Trans>
          </span>
          <span>
            <Trans>Wed</Trans>
          </span>
          <span>
            <Trans>Thu</Trans>
          </span>
          <span>
            <Trans>Fri</Trans>
          </span>
          <span>
            <Trans>Sat</Trans>
          </span>
          <span>
            <Trans>Sun</Trans>
          </span>
        </div>
        {(() => {
          const monthStart = startOfMonth(refDate);
          const start = isMonday(monthStart) ? monthStart : previousMonday(monthStart);
          const monthEnd = endOfMonth(refDate);
          const end = isMonday(monthEnd) ? monthEnd : nextMonday(monthEnd);
          const days = differenceInCalendarDays(end, start);
          return Array.from({ length: days }, (_, i) => {
            const d = add(start, { days: i });
            const eventsOnDay = events.filter((e) => isSameDay(e.start, d));
            if (!isSameMonth(d, refDate)) {
              return <div key={d.toISOString()}></div>;
            }
            return (
              <div key={d.toISOString()} className="flex min-h-24 w-full flex-col gap-1 self-start">
                <span className={cn("text-right", eventsOnDay.length === 0 && "text-muted-foreground")}>
                  {format(d, "dd")}
                </span>
                {eventsOnDay.map((e) => (
                  <a
                    key={e.id}
                    className={cn(
                      "px-1 text-sm",
                      e.isExam
                        ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                        : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
                      isSameWeek(e.start, Date.now(), { weekStartsOn: 1 }) &&
                        (e.isExam
                          ? "border border-blue-300 font-bold dark:border-blue-700"
                          : "border border-red-300 font-bold dark:border-red-700"),
                    )}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {e.title}
                  </a>
                ))}
              </div>
            );
          });
        })()}
      </div>
    </>
  );
};

export const useScheduledEvents = () => {
  const locale = getLocale();
  const { data: cnData, isLoading: isCnLoading } = useQuery({
    queryKey: [COMMUNITY_EVENT_ENDPOINT],
    queryFn: (ctx) => fetch(ctx.queryKey[0]).then((res) => res.json() as Promise<CommunityEventData>),
    enabled: locale === "zh-cn",
  });
  const { data: enData, isLoading: isEnLoading } = useQuery({
    queryKey: [VATSIM_EVENT_ENDPOINT],
    queryFn: (ctx) => fetch(ctx.queryKey[0]).then((res) => res.json() as Promise<VatsimEventData>),
    enabled: locale === "en",
  });
  const events = [
    ...(cnData?.events?.map(
      (event) =>
        ({
          id: event.id,
          start: new Date(event.starts_at),
          end: new Date(event.ends_at),
          url: `https://community.vatprc.net/${event?.post?.url}`,
          title: event?.name ?? "Unknown event",
          isExam: event.name?.includes?.("考试"),
        }) satisfies Event,
    ) ?? []),
    ...(enData?.data
      .filter((e) => e.airports.some((a) => isChinaAirport(a.icao)))
      .map(
        (event) =>
          ({
            id: event.id,
            start: event.start_time,
            end: event.end_time,
            url: event.link,
            title: event.name,
            isExam: event.type !== "Event",
          }) satisfies Event,
      ) ?? []),
  ];

  const scheduledEvents = events.filter((e) => isAfter(e.end, Date.now()));
  return { events, scheduledEvents, isCnLoading, isEnLoading };
};

export const RecentEvents: React.FC<{ className?: string }> = ({ className }) => {
  const { events, scheduledEvents, isCnLoading, isEnLoading } = useScheduledEvents();

  if (isCnLoading || isEnLoading) {
    return <Loader />;
  }

  return (
    <div className={cn(className, "grid grid-cols-2 items-start gap-4 md:grid-cols-3")}>
      <div className="col-span-2 hidden md:block">
        <EventCalendar events={events} />
      </div>
      <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
        <EventList events={scheduledEvents} direction="col" />
        <Anchor renderRoot={(props) => <Link to="/events" {...props} />}>
          <Trans>See All Events</Trans>
        </Anchor>
      </div>
    </div>
  );
};
