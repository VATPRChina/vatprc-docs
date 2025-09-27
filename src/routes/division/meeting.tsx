import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/meeting")(
  createDiscourseFileRoute("/division/meeting", "10542", "10542"),
);
