import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/pilot-softwares")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="9143" en="9143" />;
}

export default Page;
