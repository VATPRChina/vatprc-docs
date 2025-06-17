import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/introduction")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7166" en="7204" />;
}

export default Page;
