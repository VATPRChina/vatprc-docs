import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/pilot-softwares")({
  component: () => <DiscourseDocument cn="9143" en="9143" />,
  head: getDiscourseDocumentMeta("9143", "9143"),
});
