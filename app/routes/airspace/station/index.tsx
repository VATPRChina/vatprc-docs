import { DiscourseDocument } from "@/components/DiscourseDocument";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/station/")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="8884" en="8884" />;
}

export default Page;
