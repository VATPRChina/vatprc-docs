import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/airspace/rvsm")(
  createDiscourseFileRoute("/_doc/airspace/rvsm", "7182", "7208"),
);
