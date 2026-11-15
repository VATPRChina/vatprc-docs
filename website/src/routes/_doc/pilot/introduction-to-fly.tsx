import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/pilot/introduction-to-fly")(
  createDiscourseFileRoute("/_doc/pilot/introduction-to-fly", "7186", "7210"),
);
