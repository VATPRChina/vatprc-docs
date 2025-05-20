import { DiscourseDocument } from "@/components/DiscourseDocument";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/visiting-and-transferring/")({
  component: Page,
});

function Page() {
  return <DiscourseDocument cn="7189" en="7215" />;
}

export default Page;
