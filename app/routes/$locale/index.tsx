// import { ThemeToggle } from "@/components/ThemeToggle";
import * as m from "@/lib/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{m.Legacy_button_about()}</div>;
}
