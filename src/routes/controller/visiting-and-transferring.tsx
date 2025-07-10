import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/visiting-and-transferring")({
  component: () => <DiscourseDocument cn="7189" en="7215" />,
});
