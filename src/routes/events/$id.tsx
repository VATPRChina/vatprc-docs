import NoEventImage from "@/assets/no-event-image.svg";
import { DateTime } from "@/components/event/datetime";
import { EventDetail } from "@/components/event/event-detail";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/button-link";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TbArrowLeft } from "react-icons/tb";

export const Route = createFileRoute("/events/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: event } = $api.useQuery("get", "/api/events/{eid}", { params: { path: { eid: id } } });
  const { data: slots } = $api.useQuery("get", "/api/events/{eid}/slots", { params: { path: { eid: id } } });

  const rows = slots?.map((slot) => (
    <div key={slot.id} role="row" className="contents">
      <div role="cell">{slot.airspace.name}</div>
      <div role="cell">
        <div className="flex gap-1">
          <div className="flex">
            <span className="mr-1">CTOT/</span>
            <DateTime noDistance noDate>
              {slot.enter_at}
            </DateTime>
          </div>
          {slot.leave_at && (
            <div className="flex">
              <span className="mr-1">ELDT/</span>
              <DateTime noDistance noDate>
                {slot.leave_at}
              </DateTime>
            </div>
          )}
        </div>
      </div>
      {!!slot.callsign || !!slot.aircraft_type_icao ? (
        <div role="cell">
          {slot.callsign}
          {slot.aircraft_type_icao && ` with ${slot.aircraft_type_icao}`}
        </div>
      ) : (
        <div role="cell">Not designated</div>
      )}
      <div role="cell" className="flex gap-1">
        <Button variant="ghost" disabled>
          Detail
        </Button>
        <Button variant="ghost" disabled>
          Book
        </Button>
        <Button variant="ghost" disabled>
          Release
        </Button>
        <Button variant="ghost" disabled>
          Delete
        </Button>
      </div>
    </div>
  ));

  return (
    event && (
      <div key={event.id} className="flex flex-col gap-4">
        <div>
          <LinkButton variant="ghost" to="..">
            <TbArrowLeft />
            <Trans>Back</Trans>
          </LinkButton>
        </div>
        <div className="grid grid-cols-2 items-center gap-8">
          <img src={event.image_url ?? NoEventImage} className="rounded-2xl" />
          <div className="flex flex-col gap-4">
            <Link
              to="/events/$id"
              params={{ id: event.id }}
              role="heading"
              aria-level={1}
              className="text-4xl font-bold"
            >
              {event.title}
            </Link>
            <EventDetail eventId={event.id} />
          </div>
        </div>
        <h2 className="text-2xl">
          <Trans>Slots</Trans>
        </h2>
        {(slots?.length ?? 0) > 0 && (
          <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-x-8 gap-y-1" role="table">
            <div className="contents font-bold" role="row">
              <div role="columnheader">Area</div>
              <div role="columnheader">Time</div>
              <div role="columnheader">Callsign & Aircraft</div>
              <div role="columnheader"></div>
            </div>
            <div className="contents" role="rowgroup">
              {rows}
            </div>
          </div>
        )}
      </div>
    )
  );
}
