import { getLocale } from "@/lib/i18n";
import { CommunityEventData } from "@/lib/types/community";
import { VatsimEventData } from "@/lib/types/vatsim";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { format, intlFormatDistance, isAfter } from "date-fns";
import React from "react";
import { TbLoader } from "react-icons/tb";

const COMMUNITY_EVENT_ENDPOINT =
  "https://community.vatprc.net/discourse-post-event/events.json?category_id=66&include_subcategories=true&include_expired=true";
const VATSIM_EVENT_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "/api/cors/vatsim-events-prc"
    : "https://cors-proxy.vatprc.net/?target=" + encodeURIComponent("https://my.vatsim.net/api/v2/events/latest");

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
      <span>{intlFormatDistance(start, Date.now(), { locale })}</span>
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
  const { data: cnData, isLoading: isCnLoading } = useQuery({
    queryKey: [COMMUNITY_EVENT_ENDPOINT],
    queryFn: (ctx) => fetch(ctx.queryKey[0]).then((res) => res.json() as Promise<CommunityEventData>),
    enabled: getLocale() === "zh-cn",
  });
  const { data: enData, isLoading: isEnLoading } = useQuery({
    queryKey: [VATSIM_EVENT_ENDPOINT],
    queryFn: (ctx) => fetch(ctx.queryKey[0]).then((res) => res.json() as Promise<VatsimEventData>),
    enabled: getLocale() === "en",
  });

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
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events.map((e) => ({
            id: e.id.toString(),
            title: e.title,
            url: e.url,
            start: e.start,
            end: e.end,
            display: "list-item",
          }))}
          expandRows
          locale={getLocale()}
        />
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
