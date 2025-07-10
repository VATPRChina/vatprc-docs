import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/ts3")({
  component: () => <DiscourseDocument cn="7164" en="7212" />,
  head: getDiscourseDocumentMeta("7164", "7212"),
});
