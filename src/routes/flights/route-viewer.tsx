import { BackButton } from "@/components/back-button";
import { RequireRole } from "@/components/require-role";
import { RouteViewer } from "@/components/route-viewer";
import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/flights/route-viewer")({
  component: RouteComponent,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Route Viewer`) }, { name: "robots", content: "noindex" }],
  }),
});

function RouteComponent() {
  return (
    <RequireRole role="software-engineer">
      <div className="flex w-full flex-col gap-4">
        <BackButton />
        <RouteViewer />
      </div>
    </RequireRole>
  );
}
