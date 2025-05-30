import { ControllerList } from "@/components/controller-list";
import { m } from "@/lib/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/controller-list/")({
  component: Page,
});

function Page() {
  return (
    <div>
      <div className="prose dark:prose-invert min-w-full">
        <h2>{m["Legacy_nav-menu_controller-list"]()}</h2>
        <p>{m["Legacy_controller-list_description"]()}</p>
        <ul>
          <li>
            <b>✘</b> {m["Legacy_controller-list_permission-restricted"]()}
          </li>
          <li>
            <b>T</b> {m["Legacy_controller-list_permission-training"]()}
          </li>
          <li>
            <b>S</b> {m["Legacy_controller-list_permission-solo"]()}
          </li>
          <li>
            <b>✓</b> {m["Legacy_controller-list_permission-full"]()}
          </li>
          <li>
            <b>V</b> {m["Legacy_controller-list_marker-visiting"]()}
          </li>
        </ul>
        <p>{m["Legacy_controller-list_ptwr-description"]()}</p>
      </div>
      <ControllerList />
    </div>
  );
}

export default Page;
