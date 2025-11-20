import NoEventImage from "@/assets/no-event-image.svg";
import { CreateEvent } from "@/components/event/event-create";
import { EventDetail } from "@/components/event/event-detail";
import { $api } from "@/lib/client";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: events } = $api.useQuery("get", "/api/events", { params: {} });

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
      <div className="col-span-1 md:col-span-2">
        <CreateEvent />
      </div>
      {events?.map((event) => (
        <div key={event.id} className="flex flex-col gap-2 border p-4">
          <img src={event.image_url ?? NoEventImage} className="" />
          <Link to="/events/$id" params={{ id: event.id }} role="heading" aria-level={2} className="text-2xl font-bold">
            {event.title}
          </Link>
          <EventDetail eventId={event.id} />
        </div>
      ))}
    </div>
  );
}
