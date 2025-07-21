import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/rvsm")({
  component: () => <DiscourseDocument cn="7182" en="7208" />,
  head: getDiscourseDocumentMeta("7182", "7208"),
});
