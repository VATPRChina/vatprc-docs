import { DiscourseDocument } from "@/components/DiscourseDocument";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/ts3/")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7164" en="7212" />;
}

export default Page;
