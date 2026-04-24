import { EventCard } from "@/components/event/event-card";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Select } from "@mantine/core";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { endOfDay, endOfQuarter, formatISO, startOfDay, startOfQuarter, subMonths } from "date-fns";

const RECENT_RANGE = "recent";
const QUARTER_PATTERN = /^\d{4}Q[1-4]$/;
const QUARTER_COUNT = 12;

type HistorySearch = {
  range: string;
};

type RangeOption = {
  label: string;
  value: string;
};

function getQuarterValue(date: Date) {
  return `${date.getUTCFullYear()}Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
}

function parseQuarterRange(value: string) {
  if (!QUARTER_PATTERN.test(value)) return null;

  const year = Number(value.slice(0, 4));
  const quarter = Number(value.slice(-1));
  const start = startOfQuarter(new Date(Date.UTC(year, (quarter - 1) * 3, 1)));
  const end = endOfQuarter(start);

  return { start, end };
}

function getRecentRange() {
  const now = new Date();
  return {
    since: formatISO(subMonths(now, 3)),
    until: formatISO(now),
  };
}

function getQuarterOptions() {
  const currentQuarter = startOfQuarter(new Date());

  return Array.from({ length: QUARTER_COUNT }, (_, index): RangeOption => {
    const quarterDate = new Date(
      Date.UTC(currentQuarter.getFullYear(), currentQuarter.getMonth() - index * 3, currentQuarter.getDate()),
    );
    const quarterValue = getQuarterValue(quarterDate);

    return {
      value: quarterValue,
      label: quarterValue,
    };
  });
}

function getRangeQuery(range: string) {
  if (range === RECENT_RANGE) {
    return getRecentRange();
  }

  const quarterRange = parseQuarterRange(range);
  if (quarterRange) {
    return {
      since: formatISO(startOfDay(quarterRange.start)),
      until: formatISO(endOfDay(quarterRange.end)),
    };
  }

  return getRecentRange();
}

export const Route = createFileRoute("/events/history")({
  validateSearch: (search: Record<string, unknown>): HistorySearch => ({
    range: typeof search["range"] === "string" ? search["range"] : RECENT_RANGE,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { range } = Route.useSearch();
  const { t } = useLingui();
  const navigate = useNavigate({ from: Route.fullPath });
  const rangeOptions: RangeOption[] = [{ value: RECENT_RANGE, label: t`Recent 3 months` }, ...getQuarterOptions()];
  const query = getRangeQuery(range);

  const { data: events, error } = $api.useQuery("get", "/api/events/past", {
    params: {
      query,
    },
  });

  const sortedEvents = events?.toSorted(
    (a, b) => new Date(b.end_at).getTime() - new Date(a.end_at).getTime(),
  ) satisfies components["schemas"]["EventDto"][] | undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl">
            <Trans>Past Events</Trans>
          </h1>
        </div>
        <div className="flex flex-row items-center gap-1.5">
          <Link to="/events" className="w-full text-sm underline">
            <Trans>Back to upcoming events</Trans>
          </Link>
          <Select
            label={<Trans>Time Range</Trans>}
            data={rangeOptions}
            value={range}
            onChange={(value) =>
              void navigate({
                search: {
                  range: value ?? RECENT_RANGE,
                },
                replace: true,
              })
            }
            allowDeselect={false}
            className="w-full md:max-w-56"
          />
        </div>
      </div>
      {error && (
        <Alert color="red">
          <Trans>Failed to load past events.</Trans>
        </Alert>
      )}
      {!error && sortedEvents?.length === 0 && (
        <Alert>
          <Trans>No past events found in the selected time range.</Trans>
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
        {sortedEvents?.map((event) => (
          <EventCard event={event} key={event.id} />
        ))}
      </div>
    </div>
  );
}
