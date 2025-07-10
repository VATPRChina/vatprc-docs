import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/vfr")({
  component: () => <DiscourseDocument cn="7183" en="7209" />,
});
