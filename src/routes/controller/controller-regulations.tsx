import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/controller-regulations")({
  component: () => <DiscourseDocument cn="7187" en="7213" />,
  head: getDiscourseDocumentMeta("7187", "7213"),
});
