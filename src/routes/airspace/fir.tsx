import { createDiscourseFileRoute } from "@/components/discourse-doc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/fir")(createDiscourseFileRoute("/airspace/fir", "7170", "7207"));
