import { TemporaryFlightValidation } from "@/components/flight/temporary-flight-validation";
import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/flights/temporary")({
  component: TemporaryFlightValidation,
  head: (ctx) => ({
    meta: [{ name: "robots", content: "noindex" }, { title: ctx.match.context.i18n._(msg`Temporary Flight Plan`) }],
  }),
});
