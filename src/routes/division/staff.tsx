import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/staff")({
  component: () => <DiscourseDocument cn="7190" en="7205" />,
  head: getDiscourseDocumentMeta("7190", "7205"),
});
