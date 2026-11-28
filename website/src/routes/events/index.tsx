import { EventCard } from "@/components/event/event-card";
import { CreateEvent } from "@/components/event/event-create";
import { RequireRole } from "@/components/require-role";
import { LinkButton } from "@/components/ui/link-button";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Paper, Skeleton, Stack, ThemeIcon } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { FC } from "react";
import { TbArrowRight, TbCalendarOff } from "react-icons/tb";

const RouteComponent: FC = () => {
  const { t } = useLingui();
  const { data: events, error, isLoading } = $api.useQuery("get", "/api/events", { params: {} });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">
          <Trans>Events</Trans>
        </h1>
        <div className="flex flex-row flex-wrap gap-1 text-sm">
          <Link
            to="/events/history"
            search={{ range: "recent" }}
            className="text-sm text-(--mantine-color-anchor) underline"
          >
            <Trans>View past events</Trans>
          </Link>
          <RequireRole role="volunteer">
            <Link to="/events/audit" className="text-sm text-(--mantine-color-anchor) underline">
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
            <Paper key={index} withBorder p="md" className="flex flex-col gap-1">
              <Skeleton className="aspect-video w-full" />
              <Skeleton height={32} width="70%" />
              <div className="flex flex-col gap-1">
                <Skeleton height={18} width="55%" />
                <Skeleton height={18} width="80%" />
              </div>
            </Paper>
          ))}
        </div>
      )}
      {!isLoading && !error && events?.length === 0 && (
        <Paper
          component="section"
          role="status"
          withBorder
          p="md"
          className="flex min-h-64 items-center justify-center"
        >
          <Stack align="center" gap="xs" ta="center" className="max-w-lg">
            <ThemeIcon color="red" variant="light" size={64}>
              <TbCalendarOff size={32} strokeWidth={1.5} />
            </ThemeIcon>
            <h2 className="text-2xl font-bold">
              <Trans>Nothing on the calendar yet</Trans>
            </h2>
            <p className="text-dimmed text-base">
              <Trans>There are no upcoming events right now. Check back soon or explore events from the past.</Trans>
            </p>
            <LinkButton
              to="/events/history"
              search={{ range: "recent" }}
              variant="subtle"
              color="red"
              rightSection={<TbArrowRight size={16} />}
            >
              <Trans>Browse past events</Trans>
            </LinkButton>
          </Stack>
        </Paper>
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
};

export const Route = createFileRoute("/events/")({
  component: RouteComponent,
});
