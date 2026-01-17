import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, Card, Loader } from "@mantine/core";
import { ActionIcon, ActionIconGroup } from "@mantine/core";
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
import React, { FC, useMemo } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

const Event: React.FC<{
  id: string;
  title: string;
  start: Date;
  end: Date;
  isExam: boolean;
}> = ({ id, title, start, end, isExam }) => {
  const { i18n } = useLingui();
  const locale = i18n.locale;

  return (
    <Card
      component="a"
      className="flex min-w-48 flex-col gap-2 hover:bg-gray-200"
      withBorder
      renderRoot={(props) => <Link to="/events/$id" params={{ id }} target="_blank" {...props} />}
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
  id: string;
  start: Date;
  end: Date;
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
        <Event key={e.id} id={e.id} title={e.title} start={e.start} end={e.end} isExam={e.isExam} />
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
  const { i18n } = useLingui();
  const locale = i18n.locale;
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
                  <Link
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
                    to="/events/$id"
                    params={{ id: e.id }}
                    target="_blank"
                  >
                    {e.title}
                  </Link>
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
  const { i18n } = useLingui();

  const { data, isLoading } = $api.useQuery("get", "/api/events");
  const events = useMemo(
    () => [
      ...(data?.map(
        (event) =>
          ({
            id: event.id,
            start: new Date(event.start_at),
            end: new Date(event.end_at),
            title: i18n.locale === "en" ? (event.title_en ?? event.title) : event.title,
            isExam: event.title?.includes?.("考试"),
          }) satisfies Event,
      ) ?? []),
    ],
    [data],
  );

  const scheduledEvents = events.filter((e) => isAfter(e.end, Date.now()));
  return { events, scheduledEvents, isLoading };
};

export const RecentEvents: React.FC<{ className?: string }> = ({ className }) => {
  const { events, scheduledEvents, isLoading } = useScheduledEvents();

  if (isLoading) {
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
