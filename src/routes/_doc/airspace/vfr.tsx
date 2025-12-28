import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/airspace/vfr")(
  createDiscourseFileRoute("/_doc/airspace/vfr", "7183", "7209"),
);
