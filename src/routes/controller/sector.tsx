import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/sector")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="8652" en="8652" />;
}

export default Page;
