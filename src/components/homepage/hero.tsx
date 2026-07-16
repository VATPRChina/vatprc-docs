import heroImage from "@/assets/homepage/hero.jpg";
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
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

export const Hero: React.FC = () => {
  const { data } = $api.useQuery("get", "/api/compat/online-status");
  const { events } = useScheduledEvents();
  const eventsThisWeek = events.filter((e) => isSameWeek(e.start, Date.now(), { weekStartsOn: 1 })).length;

  return (
    <section className="relative w-full overflow-hidden">
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-[50px]"
      />
      <div className="absolute inset-0">
        <div className="relative mx-auto h-full w-full max-w-[84rem] [mask-image:linear-gradient(to_right,transparent,black_max(0px,calc((100%-72rem)/2)),black_calc(100%-max(0px,calc((100%-72rem)/2))),transparent)]">
          <img src={heroImage} alt="" aria-hidden className="h-full w-full scale-105 object-cover blur-[3px]" />
        </div>
      </div>
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      <div className="relative mx-auto flex min-h-[28rem] w-full max-w-6xl flex-col justify-center px-6 py-14">
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
