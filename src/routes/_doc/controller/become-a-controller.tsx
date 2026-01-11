import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { LinkButton } from "@/components/ui/link-button";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/controller/become-a-controller")(
  createDiscourseFileRoute(
    "/_doc/controller/become-a-controller",
    "7188",
    "7214",
    <LinkButton className="mb-8" to="/controllers/applications/new">
      <Trans>Apply</Trans>
    </LinkButton>,
  ),
);
