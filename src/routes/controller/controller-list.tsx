import { ControllerList } from "@/components/controller-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/controller-list")({
  component: Page,
  head: () => ({
    meta: [{ title: "Controller List" }],
  }),
});

function Page() {
  return (
    <div>
      <div className="prose dark:prose-invert min-w-full">
        <h2>Controller List</h2>
        <p>The list below is displayed based on the controller data in our ATC Center. Automatic data updates may have at most 24 hours of delay. Only controllers (including visiting controller) with controlling permission on at least one type of positions will be listed. (i.e. Controllers not in the list have no controlling permission.)</p>
        <ul>
          <li>
            <b>✘</b> Restricted: This controller is not eligible to provide service to this position.
          </li>
          <li>
            <b>T</b> In Training: This controller is eligible to provide service to this position ONLY under supervision from a mentor
          </li>
          <li>
            <b>S</b> Solo Training: This controller is eligible to provide solo service to this position for the purpose of position familiarization and fluency training.
          </li>
          <li>
            <b>✓</b> Certified: The controller is fully eligible to provide solo service to this position.
          </li>
          <li>
            <b>V</b> Visiting: This controller is a visiting controller.
          </li>
        </ul>
        <p>*T2: Tier 2 Permission. Training status for this permission is not displayed on this page.</p>
      </div>
      <ControllerList />
    </div>
  );
}

export default Page;
