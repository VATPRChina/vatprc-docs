import { RadarCoverageViewer } from "@/components/radar-coverage/viewer";
import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/radar-coverage")({
  component: RadarCoverageViewer,
  head: (ctx) => ({ meta: [{ title: ctx.match.context.i18n._(msg`Radar Coverage`) }] }),
});
