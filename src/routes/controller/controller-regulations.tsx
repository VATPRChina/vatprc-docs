import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/controller-regulations")(
  createDiscourseFileRoute("/controller/controller-regulations", "7187", "7213"),
);
