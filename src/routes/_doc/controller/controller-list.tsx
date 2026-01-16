import { ControllerList } from "@/components/homepage/controller-list";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/controller/controller-list")({
  component: Page,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`Controller List`) }],
  }),
});

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
          </li>
          <li>
            <Trans>
              <b>✓</b> Certified: The controller is fully eligible to provide solo service to this position.
            </Trans>
          </li>
          <li>
            <Trans>
              <b>V</b> Visiting: This controller is a visiting controller.
            </Trans>
          </li>
        </ul>
        <p>
          <Trans>*T2: Tier 2 Permission. Training status for this permission is not displayed on this page.</Trans>
        </p>
      </div>
      <ControllerList />
      <div className="prose vatprc-prose mt-4">
        <p>
          <Trans>Controller with Military Position Permission</Trans>
        </p>
        <ul>
          <li>1326158 Hongye Rudi Zhang</li>
          <li>1340265 Junzhe Yan</li>
          <li>1435267 Lihan Bao</li>
          <li>1478847 Jingyuan Yin</li>
          <li>1496934 Weiqi Yu</li>
          <li>1621162 Haoyu Wu</li>
          <li>1676022 Shengbo Yang</li>
          <li>1679151 Jiashu Ye</li>
          <li>1752734 Steven Zhang</li>
          <li>1897662 Xinrui Wan</li>
        </ul>
      </div>
    </div>
  );
}
