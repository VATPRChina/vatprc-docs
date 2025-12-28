import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/pilot/pilot-softwares")(
  createDiscourseFileRoute("/_doc/pilot/pilot-softwares", "9143", "9143"),
);
