import NoEventImage from "@/assets/no-event-image.svg";
import { EventSummary } from "@/components/event/event-detail";
import { components } from "@/lib/api";
import { useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";

export function EventCard({ event }: { event: components["schemas"]["EventDto"] }) {
  const { i18n } = useLingui();

  return (
    <Link to="/events/$id" params={{ id: event.id }} className="flex flex-col gap-2 border p-4">
      <img src={event.image_url ?? NoEventImage} className="mb-2 aspect-video" />
      <h2 className="text-2xl font-bold">{i18n.locale === "en" ? (event.title_en ?? event.title) : event.title}</h2>
      <EventSummary {...event} />
    </Link>
  );
}
