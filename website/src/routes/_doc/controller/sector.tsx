import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/controller/sector")(
  createDiscourseFileRoute("/_doc/controller/sector", "8652", "8652"),
);
