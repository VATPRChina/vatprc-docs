import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/controller/controller-regulations")(
  createDiscourseFileRoute("/_doc/controller/controller-regulations", "7187", "7213"),
);
