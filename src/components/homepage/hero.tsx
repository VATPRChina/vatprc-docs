import { Button } from "@/components/ui/button";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { isSameWeek, parseISO } from "date-fns";
import { FC, PropsWithChildren, ReactNode } from "react";

interface HeroCardProps {
  title: ReactNode;
  num: ReactNode;
}

const HeroCard: FC<PropsWithChildren<HeroCardProps>> = ({ title, num, children }) => {
  return (
    <div className="bg-secondary-background border-border text-foreground min-w-[10svw] space-y-2 border-2 p-4">
      <p>{title}</p>
      <p className="font-heading text-vatprc">{num}</p>
      <div className="space-x-2">{children}</div>
    </div>
  );
};

export const Hero: FC = () => {
  const { data } = $api.useQuery("get", "/api/compat/online-status");
  const { data: events } = $api.useQuery("get", "/api/events");
  const eventsThisWeek =
    events?.filter((e) => isSameWeek(parseISO(e.start_at), Date.now(), { weekStartsOn: 1 })).length ?? 0;

  return (
    <section className="bg-main text-secondary-background flex min-h-[50svh] border-b-2 pt-16 pb-4">
      <div className="container m-auto flex flex-col items-start gap-4">
        <h1 className="font-heading text-5xl md:text-7xl">
          <Trans>VATSIM P.R. China Division · VATPRC</Trans>
        </h1>
        <h2 className="font-heading text-3xl md:text-5xl">
          <Trans>Flight simulation community for China mainland</Trans>
        </h2>
        <div className="flex gap-4">
          <HeroCard title={<Trans>Pilots online</Trans>} num={data?.pilots?.length ?? "--"}>
            <Button variant="secondary">
              <Trans>Fly</Trans>
            </Button>
          </HeroCard>
          <HeroCard title={<Trans>Controllers online</Trans>} num={data?.controllers?.length ?? "--"}>
            <Button variant="secondary">
              <Trans>Control</Trans>
            </Button>
          </HeroCard>
          <HeroCard title={<Trans>Events this week</Trans>} num={eventsThisWeek}>
            <Button variant="secondary">
              <Trans>Events</Trans>
            </Button>
            <Button variant="secondary">
              <Trans>Discord</Trans>
            </Button>
            <Button variant="secondary">
              <Trans>Forum</Trans>
            </Button>
          </HeroCard>
        </div>
      </div>
    </section>
  );
};
