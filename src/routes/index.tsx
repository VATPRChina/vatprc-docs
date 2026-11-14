import { ControllersBoard } from "@/components/homepage/controllers-board";
import { EventCarousel } from "@/components/homepage/event-carousel";
import { Hero } from "@/components/homepage/hero";
import { NotamBoard } from "@/components/homepage/notam-board";
import { Button } from "@/components/ui/button";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { TbArrowRight, TbMail } from "react-icons/tb";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex w-full flex-col">
      <Hero />
      <div className="container mx-auto flex w-full flex-col gap-8 px-4 py-16">
        <EventCarousel />
        <NotamBoard />
        <ControllersBoard />
        <section className="flex flex-col items-center gap-2 border-t border-black/15 pt-16 text-center dark:border-white/20">
          <h2 className="text-2xl font-medium">
            <Trans>Feedback</Trans>
          </h2>
          <p className="max-w-xl text-gray-600 dark:text-gray-400">
            <Trans>
              Appreciation? Compliment? Criticism? You are welcome to provide feedback to the staff team via email or
              join the discussion on our forum!
            </Trans>
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            <Button variant={"neutral"} render={<a href="mailto:feedback@vatprc.net" />} nativeButton={false}>
              {<TbMail />}
              feedback@vatprc.net
            </Button>
            <Button
              variant={"neutral"}
              render={<a href="https://community.vatprc.net" target="_blank" rel="noreferrer" />}
              nativeButton={false}
            >
              <Trans>Forum</Trans>
              {<TbArrowRight />}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
