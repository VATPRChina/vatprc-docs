import { createDiscourseFileRoute } from "@/components/doc/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/pilot/ts3")(createDiscourseFileRoute("/_doc/pilot/ts3", "7164", "7212"));
