import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/loa")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7217" en="7217" />;
}

export default Page;
