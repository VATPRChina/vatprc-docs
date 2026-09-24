import { ControllerListTable } from "@/components/controller-list";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/controller/controller-list")({
  component: Page,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Controller List`) }],
  }),
});

const SOLO_POSITIONS = [
  { type: "CTR", positions: ["ZBAA_CTR", "ZGGG_CTR", "ZSSS_CTR", "ZYTL_CTR", "ZJSY_CTR"] },
  { type: "APP", positions: ["ZBAA_APP", "ZSSS_APP", "ZGGG_APP", "ZYTL_APP", "ZJSY_APP"] },
  { type: "TWR", positions: ["ZBAA_TWR", "ZSPD_TWR", "ZSSS_TWR", "ZYTL_TWR", "ZJSY_TWR"] },
];

function Page() {
  return (
    <div className="container mx-auto">
      <div className="prose dark:prose-invert min-w-full">
        <h2>
          <Trans>Controller List</Trans>
        </h2>
        <p>
          <Trans>
            The list below is displayed based on the controller data in our ATC Center. Automatic data updates may have
            at most 24 hours of delay. Only controllers (including visiting controller) with controlling permission on
            at least one type of positions will be listed. (i.e. Controllers not in the list have no controlling
            permission.)
          </Trans>
        </p>
        <ul>
          <li>
            <Trans>
              <b>✘</b> Restricted: This controller is not eligible to provide service to this position.
            </Trans>
          </li>
          <li>
            <Trans>
              <b>T</b> In Training: This controller is eligible to provide service to this position ONLY under
              supervision from a mentor
            </Trans>
          </li>
          <li>
            <Trans>
              <b>S</b> Solo Training: This controller is eligible to provide solo service to this position for the
              purpose of position familiarization and fluency training.
            </Trans>
            <br />
            <Trans>Solo is limited to the following positions:</Trans>
            <ul>
              {SOLO_POSITIONS.map(({ type, positions }) => (
                <li key={type}>
                  {type} Solo: {positions.join(", ")}
                </li>
              ))}
            </ul>
          </li>
          <li>
            <Trans>
              <b>✓</b> Certified: The controller is fully eligible to provide solo service to this position.
            </Trans>
          </li>
          <li>
            <Trans>
              <b>M</b> Mentor: This controller is eligible to mentor trainees on this type of position.
            </Trans>
          </li>
          <li>
            <Trans>
              <b>V</b> Visiting: This controller is a visiting controller.
            </Trans>
          </li>
          <li>
            <Trans>
              The <b>MIL</b> column marks controllers with military position permission.
            </Trans>
          </li>
        </ul>
        <p>
          <Trans>*T2: Tier 2 Permission. Training status for this permission is not displayed on this page.</Trans>
        </p>
      </div>
      <ControllerListTable />
    </div>
  );
}
