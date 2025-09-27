import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/station")(
  createDiscourseFileRoute("/airspace/station", "8884", "8884"),
);
