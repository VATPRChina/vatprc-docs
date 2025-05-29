import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/privacy/")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7191" en="7206" />;
}

export default Page;
