import { m } from "@/lib/i18n/messages";
import { OnlineData } from "@/lib/types/online";
import { Button, Card, Collapse, Group, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { TbCaretUpDown } from "react-icons/tb";

const ONLINE_STATUS_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "/api/cors/online-status"
    : "https://uniapi.vatprc.net/api/compat/online-status";
const fetcher = () => fetch(ONLINE_STATUS_ENDPOINT).then((res) => res.json());

const Pilot: React.FC<{
  callsign: string;
  aircraft: string;
  departure: string;
  arrival: string;
}> = ({ callsign, aircraft, departure, arrival }) => {
  return (
    <Card withBorder>
      <Text>
        <Text span fw="bold">
          {callsign}
        </Text>
        <Text span fw="light" c="gray" ml={8}>
          {aircraft}
        </Text>
      </Text>
      <Group gap={4}>
        <Text span>{departure}</Text>
        <Text span>-</Text>
        <Text span>{arrival}</Text>
      </Group>
    </Card>
  );
};

export const OnlinePilots: React.FC = () => {
  const { data, isLoading } = useQuery<OnlineData>({ queryKey: [ONLINE_STATUS_ENDPOINT], queryFn: fetcher });

  const [opened, { toggle }] = useDisclosure(false);

  if (isLoading) {
    return <Loader />;
  }

  const pilots =
    data?.pilots?.map((c) => (
      <Pilot key={c.callsign} callsign={c.callsign} aircraft={c.aircraft} departure={c.departure} arrival={c.arrival} />
    )) ?? [];

  if (pilots.length <= 0) {
    return (!data || data?.pilots.length === 0) && <Text>{m["Components_OnlinePilots_no_pilot"]()}</Text>;
  }

  return (
    <Stack gap="xs">
      <Group>{pilots?.slice(0, 8)}</Group>
      <Collapse in={opened}>
        <Group>{pilots?.slice(8)}</Group>
      </Collapse>
      <Button
        variant="outline"
        size="sm"
        rightSection={<TbCaretUpDown />}
        onClick={toggle}
        color="red"
        style={{ alignSelf: "center" }}
      >
        {opened ? m["Legacy_pilots-less"]() : m["Legacy_pilots-all"]()}
      </Button>
    </Stack>
  );
};
