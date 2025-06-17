import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/fir")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7170" en="7207" />;
}

export default Page;
