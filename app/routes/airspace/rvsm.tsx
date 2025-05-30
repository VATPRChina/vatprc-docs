import { DiscourseDocument } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/rvsm")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7182" en="7208" />;
}

export default Page;
