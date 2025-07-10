import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/station")({
  component: () => <DiscourseDocument cn="8884" en="8884" />,
});
