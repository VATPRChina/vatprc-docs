import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/pilot/start-to-fly")(
  createDiscourseFileRoute("/_doc/pilot/start-to-fly", "7185", "7211"),
);
