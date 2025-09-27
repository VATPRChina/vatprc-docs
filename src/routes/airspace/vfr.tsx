import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/vfr")(createDiscourseFileRoute("/airspace/vfr", "7183", "7209"));
