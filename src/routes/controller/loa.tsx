import { DiscourseDocument } from "@/components/discourse-doc";
import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/loa")({
  component: Page,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Letter of Agreement`) }],
  }),
});

function Page() {
  return (
    <>
      <DiscourseDocument cn="7217" en="7217" />
    </>
  );
}
