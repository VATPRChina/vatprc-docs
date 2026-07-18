import { $api, useUser } from "@/lib/client";
import { getEventTitle } from "@/lib/event";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { FC } from "react";

export const selectUpcomingEvents = <T extends { end_at: string }>(events: T[], now: Date, limit = 5): T[] =>
  events.filter((event) => new Date(event.end_at) > now).slice(0, limit);

export const selectMyPositions = <T extends { booking?: { user_id: string } | null }>(
  positions: T[],
  userId: string,
): T[] => positions.filter((position) => position.booking?.user_id === userId);

export const MyEventBookings: FC = () => {
  const user = useUser();
  const { i18n } = useLingui();
  const { data: events, error } = $api.useQuery("get", "/api/events");

  const upcoming = selectUpcomingEvents(events ?? [], new Date());
  const results = useQueries({
    queries: upcoming.map((event) =>
      $api.queryOptions("get", "/api/events/{event_id}/controllers", {
        params: { path: { event_id: event.id } },
      }),
    ),
  });
  const mine = selectMyPositions(
    results.flatMap((result) => result.data ?? []),
    user?.id ?? "",
  );

  if (!user) return null;
  if (error) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium">
          <Trans>My Event Positions</Trans>
        </h2>
        <p className="border border-gray-200 px-4 py-3 font-mono text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          <Trans>Failed to load event bookings.</Trans>
        </p>
      </section>
    );
  }
  if (mine.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-medium">
        <Trans>My Event Positions</Trans>
      </h2>
      <div className="border border-gray-200 dark:border-gray-800">
        {mine.map((position) => (
          <Link
            key={position.id}
            to="/events/$id"
            params={{ id: position.event.id }}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-l-3 border-gray-200 border-l-emerald-600 px-4 py-3 font-mono text-base last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:border-l-emerald-400 dark:hover:bg-gray-900"
          >
            <span className="min-w-28 font-bold">{position.callsign}</span>
            <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
              {getEventTitle(position.event, i18n.locale)}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {format(position.start_at, "MM-dd HHmm", { in: utc })}Z–{format(position.end_at, "HHmm", { in: utc })}Z
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
