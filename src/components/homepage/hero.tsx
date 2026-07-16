import heroImage from "@/assets/homepage/hero-placeholder.svg";
import { useScheduledEvents } from "@/components/homepage/use-scheduled-events";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { isSameWeek } from "date-fns";
import React from "react";
import { TbExternalLink } from "react-icons/tb";

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
    <section className="relative w-full overflow-hidden rounded-xl">
      <img src={heroImage} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative flex min-h-[28rem] flex-col justify-center p-10 md:p-14">
        <h1 className="text-3xl font-medium text-white md:text-4xl">
          <Trans>VATSIM P.R. China Division · VATPRC</Trans>
        </h1>
        <p className="text-vatprc-bright mt-4 text-xl font-medium italic">
          <Trans>
            <b>VATPRC 有你更精彩</b>
            <br />
            You make the difference!
          </Trans>
        </p>
        <div className="mt-8 flex flex-col items-start gap-3">
          <div className="flex flex-wrap gap-3">
            <Button color="var(--color-vatprc)" component={Link} to="/controllers/applications">
              <Trans>Join the controller team</Trans>
            </Button>
            <Button variant="outline" color="gray.0" component={Link} to="/pilot/introduction-to-fly">
              <Trans>How to fly</Trans>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" color="gray.0" component={Link} to="/flights">
              <Trans>Flight plan checker</Trans>
            </Button>
            <Button
              variant="outline"
              color="gray.0"
              component="a"
              href="https://community.vatprc.net"
              target="_blank"
              rel="noreferrer"
              rightSection={<TbExternalLink size={14} />}
            >
              <Trans>Forum</Trans>
            </Button>
          </div>
        </div>
        <div className="mt-10 flex gap-10 font-mono">
          <HeroStat value={data?.pilots?.length ?? "--"} label={<Trans>Pilots online</Trans>} />
          <HeroStat value={data?.controllers?.length ?? "--"} label={<Trans>Controllers online</Trans>} />
          <HeroStat value={eventsThisWeek} label={<Trans>Events this week</Trans>} accent />
        </div>
      </div>
    </section>
  );
};
