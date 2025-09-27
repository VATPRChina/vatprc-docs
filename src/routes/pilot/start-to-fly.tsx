import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/start-to-fly")(
  createDiscourseFileRoute("/pilot/start-to-fly", "7185", "7211"),
);
