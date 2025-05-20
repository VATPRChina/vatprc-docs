import { DiscourseDocument } from "@/components/DiscourseDocument";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/start-to-fly/")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7185" en="7211" />;
}

export default Page;
