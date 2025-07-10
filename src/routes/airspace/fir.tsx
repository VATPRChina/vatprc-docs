import { DiscourseDocument, getDiscourseDocumentMeta } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/fir")({
  component: () => <DiscourseDocument cn="7170" en="7207" />,
  head: getDiscourseDocumentMeta("7170", "7207"),
});
