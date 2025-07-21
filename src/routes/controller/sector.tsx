import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/sector")({
  component: () => <DiscourseDocument cn="8652" en="8652" />,
  head: getDiscourseDocumentMeta("8652", "8652"),
});
