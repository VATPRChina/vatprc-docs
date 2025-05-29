import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/become-a-controller/")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7188" en="7214" />;
}

export default Page;
