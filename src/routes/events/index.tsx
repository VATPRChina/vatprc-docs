import { EventCard } from "@/components/event/event-card";
import { CreateEvent } from "@/components/event/event-create";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: events } = $api.useQuery("get", "/api/events", { params: {} });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl">
          <Trans>Events</Trans>
        </h1>
        <Link to="/events/history" search={{ range: "recent" }} className="text-sm underline">
          <Trans>View past events</Trans>
        </Link>
      </div>
      <div className="col-span-1 md:col-span-2">
        <CreateEvent />
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
        {events?.map((event) => (
          <EventCard event={event} key={event.id} />
        ))}
      </div>
    </div>
  );
}
