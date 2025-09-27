import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pilot/ts3")(createDiscourseFileRoute("/pilot/ts3", "7164", "7212"));
