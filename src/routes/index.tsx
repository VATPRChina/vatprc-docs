import { Hero } from "@/components/homepage/hero";
import { LiveNetwork } from "@/components/homepage/live-network";
import { NotamBoard } from "@/components/homepage/notam-board";
import { RecentEvents } from "@/components/homepage/recent-events";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { TbArrowRight, TbMail } from "react-icons/tb";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex w-full flex-col">
      <Hero />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16">
        <NotamBoard />
        <LiveNetwork />
        <section>
          <h2 className="mb-4 text-2xl font-medium">
            <Trans>Recent Events</Trans>
          </h2>
          <RecentEvents className="w-full" />
        </section>
        <section className="flex flex-col items-center gap-6 border-t border-gray-200 pt-16 text-center dark:border-gray-800">
          <h2 className="text-2xl font-medium">
            <Trans>Feedback</Trans>
          </h2>
          <p className="max-w-xl text-gray-600 dark:text-gray-400">
            <Trans>
              Appreciation? Compliment? Criticism? You are welcome to provide feedback to the staff team via email or
              join the discussion on our forum!
            </Trans>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="subtle"
              color="red"
              component="a"
              href="mailto:feedback@vatprc.net"
              leftSection={<TbMail />}
            >
              feedback@vatprc.net
            </Button>
            <Button
              variant="subtle"
              color="red"
              component="a"
              href="https://community.vatprc.net"
              target="_blank"
              rel="noreferrer"
              rightSection={<TbArrowRight />}
            >
              <Trans>Forum</Trans>
            </Button>
          </div>
          <p className="text-vatprc dark:text-vatprc-bright pt-6 text-2xl font-medium italic">
            <Trans>
              <b>VATPRC 有你更精彩</b>
              <br />
              You make the difference!
            </Trans>
          </p>
        </section>
      </div>
    </div>
  );
}
