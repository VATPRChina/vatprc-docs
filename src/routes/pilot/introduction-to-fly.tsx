import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/introduction-to-fly")(
  createDiscourseFileRoute("/pilot/introduction-to-fly", "7186", "7210"),
);
