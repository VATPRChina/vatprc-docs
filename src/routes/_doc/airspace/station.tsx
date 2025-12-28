import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/airspace/station")(
  createDiscourseFileRoute("/_doc/airspace/station", "8884", "8884"),
);
