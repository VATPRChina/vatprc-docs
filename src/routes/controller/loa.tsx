import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/loa")({
  component: () => <DiscourseDocument cn="7217" en="7217" />,
});
