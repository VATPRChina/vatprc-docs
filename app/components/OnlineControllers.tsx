import { m } from "@/lib/i18n/messages";
import { OnlineData } from "@/lib/types/online";
import { Card, Group, Loader, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";

const ONLINE_STATUS_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "/api/cors/online-status"
    : "https://uniapi.vatprc.net/api/compat/online-status";
const fetcher = () => fetch(ONLINE_STATUS_ENDPOINT).then((res) => res.json());

const Controller: React.FC<{
  callsign: string;
  name: string;
  schedule?: [Date, Date];
  frequency?: string;
}> = ({ callsign, name, frequency, schedule }) => {
  return (
    <Card withBorder>
      <Text fw="bold" size="lg">
        {callsign}
        {frequency && (
          <Text span ml={8} size="md" c="gray">
            {frequency}
          </Text>
        )}
      </Text>
      <Text>{name}</Text>
      {schedule && (
        <Group gap={1}>
          <Text>{format(schedule[0], "MM-dd")}</Text>
          <Text>
            {format(schedule[0], "HHmm")}
            <Text size="sm" fw="light">
              L
            </Text>
          </Text>
          <Text>-</Text>
          <Text>
            {format(schedule[1], "HHmm")}
            <Text size="sm" fw="light">
              L
            </Text>
          </Text>
        </Group>
      )}
    </Card>
  );
};

export const OnlineControllers: React.FC = () => {
  const { data, isLoading } = useQuery<OnlineData>({
    queryKey: ["https://uniapi.vatprc.net/api/compat/online-status"],
    queryFn: fetcher,
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Group>
      {data?.controllers?.map((c) => (
        <Controller key={c.callsign} callsign={c.callsign} name={c.name} frequency={c.frequency} />
      ))}
      {data?.futureControllers?.map((c) => (
        <Controller
          key={c.callsign}
          callsign={c.callsign}
          name={c.name}
          schedule={[new Date(c.start), new Date(c.end)]}
        />
      ))}
      {(!data || data?.controllers.length === 0) && <Text>{m["Legacy_no-atc-online"]()}</Text>}
    </Group>
  );
};
