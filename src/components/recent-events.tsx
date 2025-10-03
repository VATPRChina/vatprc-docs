import { Button } from "./ui/button";
import { getLocale } from "@/lib/i18n";
import { CommunityEventData } from "@/lib/types/community";
import { VatsimEventData } from "@/lib/types/vatsim";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
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
import React from "react";
import { TbChevronLeft, TbChevronRight, TbLoader } from "react-icons/tb";

const COMMUNITY_EVENT_ENDPOINT =
  "https://community.vatprc.net/discourse-post-event/events.json?category_id=66&include_subcategories=true&include_expired=true";
const VATSIM_EVENT_ENDPOINT = "/uniapi/api/compat/homepage/events/vatsim";

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
    <a
      className="hover:bg-secondary flex min-w-48 flex-col gap-2 rounded-md border px-6 py-4 shadow-md"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span
        className={cn(
          "text-xl font-bold",
          isExam ? "text-blue-900 dark:text-blue-100" : "text-red-900 dark:text-red-100",
        )}
      >
        {title}
      </span>
      <span>
        {intlFormatDistance(start, Date.now(), { locale })}
        {isSameWeek(start, Date.now(), { weekStartsOn: 1 }) && (
          <span className="ml-2 rounded-md bg-red-200 px-1 py-0.5 dark:bg-red-800">
            <Trans>In This Week</Trans>
          </span>
        )}
      </span>
      <div className="flex gap-1">
        <span>{format(start, "MM-dd", { in: utc })}</span>
        <span>
          {format(start, "HHmm", { in: utc })}
          <span className="text-sm font-light">Z</span>
        </span>
        <span>-</span>
        <span>
          {format(end, "HHmm", { in: utc })}
          <span className="text-sm font-light">Z</span>
        </span>
      </div>
      <div className="flex gap-1">
        <span>{format(start, "MM-dd")}</span>
        <span>
          {format(start, "HHmm")}
          <span className="text-sm font-light">L</span>
        </span>
        <span>-</span>
        <span>
          {format(end, "HHmm")}
          <span className="text-sm font-light">L</span>
        </span>
      </div>
    </a>
  );
};

export const RecentEvents: React.FC<{ className?: string }> = ({ className }) => {
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

  const [refDate, setRefDate] = React.useState(new Date());

  if (isCnLoading || isEnLoading) {
    return <TbLoader className="m-auto h-24 animate-spin" size={48} />;
  }

  const events = [
    ...(cnData?.events?.map((event) => {
      return {
        id: event.id,
        start: new Date(event.starts_at),
        end: new Date(event.ends_at),
        url: `https://community.vatprc.net/${event?.post?.url}`,
        title: event?.name ?? "Unknown event",
        isExam: event.name?.includes?.("考试"),
      };
    }) ?? []),
    ...(enData?.data
      .filter((e) => e.airports.some((a) => isChinaAirport(a.icao)))
      .map((event) => ({
        id: event.id,
        start: event.start_time,
        end: event.end_time,
        url: event.link,
        title: event.name,
        isExam: event.type !== "Event",
      })) ?? []),
  ];
  // .filter((e) => isBefore(e.start, addDays(Date.now(), 30)));

  const scheduledEvents = events.filter((e) => isAfter(e.start, Date.now()));

  return (
    <div className={cn(className, "grid grid-cols-2 gap-4 md:grid-cols-3")}>
      <div className="col-span-2">
        <div className="my-6 flex items-center justify-between">
          <h4 className="text-3xl">{intlFormat(refDate, { year: "numeric", month: "long" }, { locale })}</h4>
          <div>
            <Button variant="ghost" onClick={() => setRefDate(sub(refDate, { months: 1 }))}>
              <TbChevronLeft />
            </Button>
            <Button variant="ghost" onClick={() => setRefDate(add(refDate, { months: 1 }))}>
              <TbChevronRight />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 items-center justify-items-center gap-4">
          <div className="contents font-bold">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
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
                <div key={d.toISOString()} className="flex min-h-24 w-full flex-col gap-1 self-end">
                  <span className={cn("text-right", eventsOnDay.length === 0 && "text-muted-foreground")}>
                    {format(d, "dd")}
                  </span>
                  {eventsOnDay.map((e) => (
                    <a
                      key={e.id}
                      className={cn(
                        "rounded px-1 text-sm",
                        e.isExam
                          ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                          : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
                        isSameWeek(e.start, Date.now(), { weekStartsOn: 1 }) &&
                          "border border-red-700 font-bold dark:border-red-300",
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
      </div>
      <div className="col-span-2 flex flex-col items-stretch gap-2 md:col-span-1">
        {scheduledEvents.map((e) => (
          <Event key={e.id} title={e.title} url={e.url} start={e.start} end={e.end} isExam={e.isExam} />
        ))}
        {scheduledEvents.length === 0 && (
          <span>
            <Trans>No event is scheduled recently.</Trans>
          </span>
        )}
      </div>
    </div>
  );
};
