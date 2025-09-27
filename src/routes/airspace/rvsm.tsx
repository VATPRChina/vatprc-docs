import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/rvsm")(createDiscourseFileRoute("/airspace/rvsm", "7182", "7208"));
