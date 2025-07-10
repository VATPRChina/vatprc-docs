import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/start-to-fly")({
  component: () => <DiscourseDocument cn="7185" en="7211" />,
  head: getDiscourseDocumentMeta("7185", "7211"),
});
