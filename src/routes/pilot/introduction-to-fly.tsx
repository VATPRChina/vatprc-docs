import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/introduction-to-fly")({
  component: () => <DiscourseDocument cn="7186" en="7210" />,
});
