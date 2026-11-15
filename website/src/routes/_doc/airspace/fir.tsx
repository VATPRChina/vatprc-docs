import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/airspace/fir")(
  createDiscourseFileRoute("/_doc/airspace/fir", "7170", "7207"),
);
