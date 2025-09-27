import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/staff")(createDiscourseFileRoute("/division/staff", "7190", "7205"));
