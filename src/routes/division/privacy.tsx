import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/privacy")(
  createDiscourseFileRoute("/division/privacy", "7191", "7206"),
);
