import NoEventImage from "@/assets/no-event-image.svg";
import { CreateEvent } from "@/components/event/event-create";
import { EventSummary } from "@/components/event/event-detail";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { i18n } = useLingui();

  const { data: events } = $api.useQuery("get", "/api/events", { params: {} });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>Events</Trans>
      </h1>
      <div className="col-span-1 md:col-span-2">
        <CreateEvent />
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
        {events?.map((event) => (
          <Link to="/events/$id" params={{ id: event.id }} key={event.id} className="flex flex-col gap-2 border p-4">
            <img src={event.image_url ?? NoEventImage} className="mb-2" />
            <h2 className="text-2xl font-bold">
              {i18n.locale === "en" ? (event.title_en ?? event.title) : event.title}
            </h2>
            <EventSummary {...event} />
          </Link>
        ))}
      </div>
    </div>
  );
}
