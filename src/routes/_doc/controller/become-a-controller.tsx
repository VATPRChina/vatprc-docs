import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/controller/become-a-controller")(
  createDiscourseFileRoute(
    "/_doc/controller/become-a-controller",
    "7188",
    "7214",
    <Button renderRoot={(props) => <Link {...props} to="/controllers/applications/new" />} className="mb-8">
      <Trans>Apply</Trans>
    </Button>,
  ),
);
