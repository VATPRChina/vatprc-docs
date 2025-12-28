import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/controller/visiting-and-transferring")(
  createDiscourseFileRoute("/_doc/controller/visiting-and-transferring", "7189", "7215"),
);
