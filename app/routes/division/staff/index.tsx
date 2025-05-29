import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/staff/")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7190" en="7205" />;
}

export default Page;
