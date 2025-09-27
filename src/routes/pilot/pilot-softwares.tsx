import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/pilot-softwares")(
  createDiscourseFileRoute("/pilot/pilot-softwares", "9143", "9143"),
);
