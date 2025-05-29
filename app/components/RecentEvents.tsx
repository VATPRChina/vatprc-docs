import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import { CommunityEventData } from "@/lib/types/community";
import { VatsimEventData } from "@/lib/types/vatsim";
import { utc } from "@date-fns/utc";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { Card, Grid, Group, Loader, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, intlFormatDistance, isAfter, isBefore, subDays } from "date-fns";
import React from "react";

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
}> = ({ title, start, end, url }) => {
  const locale = getLocale();

  return (
    <Card component="a" href={url} target="_blank" rel="noopener noreferrer" withBorder>
      <Text fw="bold" size="xl">
        {title}
      </Text>
      <Text>{intlFormatDistance(start, Date.now(), { locale })}</Text>
      <Group gap={8}>
        <Text span>{format(start, "MM-dd", { in: utc })}</Text>
        <Text span>
          {format(start, "HHmm", { in: utc })}
          <Text span size="sm" fw="light">
            Z
          </Text>
        </Text>
        <Text span>-</Text>
        <Text span>
          {format(end, "HHmm", { in: utc })}
          <Text span size="sm" fw="light">
            Z
          </Text>
        </Text>
      </Group>
      <Group gap={8}>
        <Text>{format(start, "MM-dd")}</Text>
        <Text>
          {format(start, "HHmm")}
          <Text span size="sm" fw="light">
            L
          </Text>
        </Text>
        <Text>-</Text>
        <Text>
          {format(end, "HHmm")}
          <Text span size="sm" fw="light">
            L
          </Text>
        </Text>
      </Group>
    </Card>
  );
};

export const RecentEvents: React.FC = () => {
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
    return <Loader />;
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
  ].filter((e) => isBefore(e.start, addDays(Date.now(), 30)));

  const scheduledEvents = events.filter((e) => isAfter(e.start, subDays(Date.now(), 14)));

  return (
    <Grid style={{ justifyItems: "center", alignItems: "center" }} w="100%">
      <Grid.Col span={{ base: 12, md: 8 }}>
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
          height="auto"
          displayEventTime={false}
          eventTextColor="black"
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack>
          {scheduledEvents.map((e) => (
            <Event key={e.id} title={e.title} url={e.url} start={e.start} end={e.end} isExam={e.isExam} />
          ))}
          {scheduledEvents.length === 0 && <Text>{m["Components_RecentEvents_no_event"]()}</Text>}
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
