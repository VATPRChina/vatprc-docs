import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/division/introduction")(
  createDiscourseFileRoute("/_doc/division/introduction", "7166", "7204"),
);
