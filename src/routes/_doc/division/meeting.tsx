import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/division/meeting")(
  createDiscourseFileRoute("/_doc/division/meeting", "10542", "10542"),
);
