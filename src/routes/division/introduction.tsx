import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/introduction")(
  createDiscourseFileRoute("/division/introduction", "7166", "7204"),
);
