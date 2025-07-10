import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/meeting")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="10542" en="10542" />;
}

export default Page;
