import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/visiting-and-transferring")(
  createDiscourseFileRoute("/controller/visiting-and-transferring", "7189", "7215"),
);
