import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/sector")(
  createDiscourseFileRoute("/controller/sector", "8652", "8652"),
);
