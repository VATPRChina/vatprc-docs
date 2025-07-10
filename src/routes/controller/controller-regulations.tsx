import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/controller-regulations")({
  component: () => <DiscourseDocument cn="7187" en="7213" />,
});
