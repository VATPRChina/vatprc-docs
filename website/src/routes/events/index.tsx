import { EventCard } from "@/components/event/event-card";
import { CreateEvent } from "@/components/event/event-create";
import { RequireRole } from "@/components/require-role";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Skeleton } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TbArrowRight, TbCalendarOff } from "react-icons/tb";

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useLingui();
  const { data: events, error, isLoading } = $api.useQuery("get", "/api/events", { params: {} });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl">
          <Trans>Events</Trans>
        </h1>
        <div className="flex flex-row flex-wrap gap-1 text-sm">
          <Link to="/events/history" search={{ range: "recent" }} className="underline">
            <Trans>View past events</Trans>
          </Link>
          <RequireRole role="volunteer">
            <Link to="/events/audit" className="underline">
              <Trans>View audit logs</Trans>
            </Link>
          </RequireRole>
        </div>
      </div>
      <div className="col-span-1 md:col-span-2">
        <CreateEvent />
      </div>
      {error && (
        <Alert color="red" title={<Trans>Failed to load events</Trans>}>
          {error.detail}
        </Alert>
      )}
      {isLoading && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2" aria-label={t`Loading events`}>
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="flex flex-col gap-1 border p-4">
              <Skeleton className="aspect-video w-full" />
              <Skeleton height={32} width="70%" />
              <div className="flex flex-col gap-1">
                <Skeleton height={18} width="55%" />
                <Skeleton height={18} width="80%" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && !error && events?.length === 0 && (
        <section
          role="status"
          className="relative isolate flex min-h-64 items-center justify-center overflow-hidden border border-dashed border-black/20 bg-linear-to-br from-gray-50 via-white to-red-50 p-4 dark:border-white/20 dark:from-gray-950 dark:via-gray-950 dark:to-red-950/30"
        >
          <div
            aria-hidden
            className="absolute -top-20 -right-20 size-56 rounded-full bg-red-200/30 blur-3xl dark:bg-red-900/20"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-16 size-56 rounded-full bg-gray-300/30 blur-3xl dark:bg-gray-700/20"
          />
          <div className="relative flex max-w-lg flex-col items-center gap-1 text-center">
            <div className="mb-1 flex size-16 items-center justify-center border border-red-200 bg-white/80 text-red-700 shadow-sm backdrop-blur dark:border-red-900 dark:bg-gray-950/80 dark:text-red-300">
              <TbCalendarOff size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium">
              <Trans>Nothing on the calendar yet</Trans>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              <Trans>There are no upcoming events right now. Check back soon or explore events from the past.</Trans>
            </p>
            <Link to="/events/history" search={{ range: "recent" }}>
              <Button component="span" variant="subtle" color="red" rightSection={<TbArrowRight size={16} />}>
                <Trans>Browse past events</Trans>
              </Button>
            </Link>
          </div>
        </section>
      )}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {events?.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </div>
      )}
    </div>
  );
}
