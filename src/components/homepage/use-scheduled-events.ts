import { $api } from "@/lib/client";
import { useLingui } from "@lingui/react/macro";
import { isAfter } from "date-fns";
import { useMemo } from "react";

export interface ScheduledEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  isExam: boolean;
  imageUrl: string | null;
}

export const useScheduledEvents = () => {
  const { i18n } = useLingui();

  const { data, isLoading } = $api.useQuery("get", "/api/events");
  const events = useMemo(
    () =>
      data?.map(
        (event) =>
          ({
            id: event.id,
            start: new Date(event.start_at),
            end: new Date(event.end_at),
            title: i18n.locale === "en" ? (event.title_en ?? event.title) : event.title,
            isExam: event.title?.includes?.("考试"),
            imageUrl: event.image_url ?? null,
          }) satisfies ScheduledEvent,
      ) ?? [],
    [data, i18n.locale],
  );

  const scheduledEvents = events.filter((e) => isAfter(e.end, Date.now()));
  return { events, scheduledEvents, isLoading };
};
