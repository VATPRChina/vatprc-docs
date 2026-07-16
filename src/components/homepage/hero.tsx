import heroImage from "@/assets/homepage/hero-placeholder.svg";
import { useScheduledEvents } from "@/components/homepage/recent-events";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { isSameWeek } from "date-fns";
import React from "react";

const HeroStat: React.FC<{ value: React.ReactNode; label: React.ReactNode; accent?: boolean }> = ({
  value,
  label,
  accent,
}) => (
  <div className="flex flex-col">
    <span className={accent ? "text-vatprc-bright text-2xl" : "text-2xl text-white"}>{value}</span>
    <span className="text-xs text-gray-300">{label}</span>
  </div>
);

export const Hero: React.FC = () => {
  const { data } = $api.useQuery("get", "/api/compat/online-status");
  const { events } = useScheduledEvents();
  const eventsThisWeek = events.filter((e) => isSameWeek(e.start, Date.now(), { weekStartsOn: 1 })).length;

  return (
    <section className="relative w-full overflow-hidden">
      <img src={heroImage} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-6 py-20">
        <p className="text-vatprc-bright mb-4 font-medium">
          <Trans>VATSIM P.R. China Division · VATPRC</Trans>
        </p>
        <h1 className="max-w-3xl text-5xl leading-tight font-medium text-white md:text-6xl">
          <Trans>Fly with real people controlling real procedures</Trans>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-gray-200">
          <Trans>
            Chinese airspace on the VATSIM network, where every radio call is answered by a human controller.
          </Trans>
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg" color="var(--color-vatprc)" component={Link} to="/division/introduction">
            <Trans>Join VATPRC</Trans>
          </Button>
          <Button size="lg" variant="outline" color="gray.0" component={Link} to="/pilot/start-to-fly">
            <Trans>Start to Fly</Trans>
          </Button>
        </div>
        <div className="mt-14 flex gap-10 font-mono">
          <HeroStat value={data?.pilots?.length ?? "--"} label={<Trans>Pilots online</Trans>} />
          <HeroStat value={data?.controllers?.length ?? "--"} label={<Trans>Controllers online</Trans>} />
          <HeroStat value={eventsThisWeek} label={<Trans>Events this week</Trans>} accent />
        </div>
      </div>
    </section>
  );
};
