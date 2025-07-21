import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/meeting")({
  component: () => <DiscourseDocument cn="10542" en="10542" />,
  head: getDiscourseDocumentMeta("10542", "10542"),
});
