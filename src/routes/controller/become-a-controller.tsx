import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/become-a-controller")(
  createDiscourseFileRoute("/controller/become-a-controller", "7188", "7214"),
);
