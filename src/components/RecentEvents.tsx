"use client";

import { CommunityEventData } from "@/lib/types/community";
import { VatsimEventData } from "@/lib/types/vatsim";
import { cn } from "@/lib/utils";
import {
  addDays,
  format,
  intlFormatDistance,
  isAfter,
  isBefore,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Loader } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import useSWR from "swr";

const COMMUNITY_EVENT_ENDPOINT =
  "https://community.vatprc.net/discourse-post-event/events.json?category_id=66&include_subcategories=true&include_expired=true";
const VATSIM_EVENT_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "/api/cors/vatsim-events-prc"
    : "https://cors-proxy.vatprc.net/?target=" +
      encodeURIComponent("https://my.vatsim.net/api/v2/events/latest");
const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

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
  const locale = useLocale();

  return (
    <a
      className="flex min-w-48 flex-col gap-2 rounded-md border px-6 py-4 shadow-md hover:bg-gray-50"
      href={url}
      target="_blank"
    >
      <span
        className={cn(
          "text-xl font-bold",
          isExam ? "text-blue-900" : "text-red-900",
        )}
      >
        {title}
      </span>
      <span>{intlFormatDistance(start, Date.now(), { locale })}</span>
      <div className="flex gap-1">
        <span>{formatInTimeZone(start, "UTC", "MM-dd")}</span>
        <span>
          {formatInTimeZone(start, "UTC", "HHmm")}
          <span className="text-sm font-light">Z</span>
        </span>
        <span>-</span>
        <span>
          {formatInTimeZone(end, "UTC", "HHmm")}
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

export const RecentEvents: React.FC<{ className: string }> = ({
  className,
}) => {
  const locale = useLocale();
  const t = useTranslations("Components.RecentEvents");

  const { data: cnData, isLoading: isCnLoading } = useSWR<CommunityEventData>(
    locale === "zh-cn" ? COMMUNITY_EVENT_ENDPOINT : null,
    fetcher,
  );
  const { data: enData, isLoading: isEnLoading } = useSWR<VatsimEventData>(
    locale === "en" ? VATSIM_EVENT_ENDPOINT : null,
    fetcher,
  );

  if (isCnLoading || isEnLoading) {
    return <Loader className="h-24" size={48} />;
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
  ]
    .filter((e) => isAfter(e.start, Date.now()))
    .filter((e) => isBefore(e.start, addDays(Date.now(), 30)));

  return (
    <div className={cn(className, "flex flex-wrap justify-center gap-4")}>
      {events.map((e) => (
        <Event
          key={e.id}
          title={e.title}
          url={e.url}
          start={e.start}
          end={e.end}
          isExam={e.isExam}
        />
      ))}
      {events.length === 0 && <span>{t("no_event")}</span>}
    </div>
  );
};
