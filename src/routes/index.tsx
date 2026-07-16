import { ControllersBoard } from "@/components/homepage/controllers-board";
import { EventCarousel } from "@/components/homepage/event-carousel";
import { Hero } from "@/components/homepage/hero";
import { NotamBoard } from "@/components/homepage/notam-board";
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
      <div className="mx-auto w-full max-w-6xl px-6 pt-10">
        <Hero />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16">
        <EventCarousel />
        <NotamBoard />
        <ControllersBoard />
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
        </section>
      </div>
    </div>
  );
}
