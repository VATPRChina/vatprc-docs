import { FlightSearch } from "@/components/flight/flight-search";
import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/flights/")({
  component: FlightSearch,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Flight Plan Checker`) }],
  }),
});
