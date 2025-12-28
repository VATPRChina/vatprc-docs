import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/division/staff")(
  createDiscourseFileRoute("/_doc/division/staff", "7190", "7205"),
);
