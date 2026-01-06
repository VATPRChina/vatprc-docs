import NoEventImage from "@/assets/no-event-image.svg";
import { BackButton } from "@/components/back-button";
import { AtcSlotList } from "@/components/event/atc-slot-list";
import { CreateEvent } from "@/components/event/event-create";
import { EventDetail } from "@/components/event/event-detail";
import { SlotList } from "@/components/event/slot-list";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Tabs } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TbAirTrafficControl, TbCalendar } from "react-icons/tb";

export const Route = createFileRoute("/events/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: id } } });

  return (
    event && (
      <div key={event.id} className="flex flex-col gap-4">
        <BackButton />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <img src={event.image_url ?? NoEventImage} className="" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-2">
              <Link
                to="/events/$id"
                params={{ id: event.id }}
                role="heading"
                aria-level={1}
                className="text-4xl font-bold"
              >
                {event.title}
              </Link>
              <CreateEvent eventId={event?.id} />
            </div>
            <EventDetail eventId={event.id} />
          </div>
        </div>
        <Tabs defaultValue="slot">
          <Tabs.List className="mb-4">
            <Tabs.Tab value="slot" leftSection={<TbCalendar />}>
              <Trans>Slots</Trans>
            </Tabs.Tab>
            <Tabs.Tab value="controller" leftSection={<TbAirTrafficControl />}>
              <Trans>Controllers</Trans>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="slot" className="flex flex-col gap-4">
            <SlotList eventId={event.id} />
          </Tabs.Panel>

          <Tabs.Panel value="controller" className="flex flex-col gap-4">
            <AtcSlotList eventId={event.id} />
          </Tabs.Panel>
        </Tabs>
      </div>
    )
  );
}
