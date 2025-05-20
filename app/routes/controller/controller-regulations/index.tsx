import { DiscourseDocument } from "@/components/DiscourseDocument";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/controller-regulations/")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7187" en="7213" />;
}

export default Page;
