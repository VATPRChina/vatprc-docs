import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/controller/become-a-controller")(
  createDiscourseFileRoute("/_doc/controller/become-a-controller", "7188", "7214"),
);
