import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/division/privacy")(
  createDiscourseFileRoute("/_doc/division/privacy", "7191", "7206"),
);
