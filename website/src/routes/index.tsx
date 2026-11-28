import { ControllersBoard } from "@/components/homepage/controllers-board";
import { EventCarousel } from "@/components/homepage/event-carousel";
import { Hero } from "@/components/homepage/hero";
import { NotamBoard } from "@/components/homepage/notam-board";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";
import { TbArrowRight, TbMail } from "react-icons/tb";

const RouteComponent: FC = () => {
  return (
    <div className="flex w-full flex-col">
      <Hero />
      <div className="container mx-auto flex w-full flex-col gap-8 px-4 py-16">
        <EventCarousel />
        <NotamBoard />
        <ControllersBoard />
        <section className="flex flex-col items-center gap-2 border-t border-black/15 pt-16 text-center dark:border-white/20">
          <h2 className="text-2xl font-bold">
            <Trans>Feedback</Trans>
          </h2>
          <p className="text-dimmed max-w-xl text-base">
            <Trans>
              Appreciation? Compliment? Criticism? You are welcome to provide feedback to the staff team via email or
              join the discussion on our forum!
            </Trans>
          </p>
          <div className="flex flex-wrap justify-center gap-1">
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
};

export const Route = createFileRoute("/")({
  component: RouteComponent,
});
