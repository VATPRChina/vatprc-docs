import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/introduction")({
  component: () => <DiscourseDocument cn="7166" en="7204" />,
});
