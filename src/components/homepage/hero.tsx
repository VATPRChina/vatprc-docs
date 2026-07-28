import heroImage from "@/assets/homepage/hero.jpg";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { isSameWeek, parseISO } from "date-fns";
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
  const { data: events } = $api.useQuery("get", "/api/events");
  const eventsThisWeek =
    events?.filter((e) => isSameWeek(parseISO(e.start_at), Date.now(), { weekStartsOn: 1 })).length ?? 0;

  return (
    <section className="relative w-full overflow-hidden">
      <img src={heroImage} aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-[50px]" />
      <div className="absolute inset-0">
        <div className="relative mx-auto h-full w-full max-w-336 mask-[linear-gradient(to_right,transparent,black_max(0px,calc((100%-72rem)/2)),black_calc(100%-max(0px,calc((100%-72rem)/2))),transparent)]">
          <img src={heroImage} aria-hidden className="h-full w-full scale-105 object-cover blur-[3px]" />
        </div>
      </div>
      <div className="relative mx-auto flex min-h-112 w-full max-w-6xl flex-col items-start justify-center gap-4 px-4 py-16">
        <div className="flex flex-col items-start gap-2">
          <h1 className="bg-black/70 px-4 py-2 text-3xl font-medium text-white md:text-4xl">
            <Trans>VATSIM P.R. China Division · VATPRC</Trans>
          </h1>
          <p className="bg-black/70 px-4 py-2 text-xl font-medium text-white italic">
            <Trans>
              <b>VATPRC 有你更精彩</b>
              <br />
              You make the difference!
            </Trans>
          </p>
        </div>
        <div className="grid w-fit grid-cols-2 gap-1">
          <Button color="vatprc" component={Link} to="/controllers">
            <Trans>Join the controller team</Trans>
          </Button>
          <Button color="dark" component={Link} to="/pilot/introduction-to-fly">
            <Trans>How to fly</Trans>
          </Button>
          <Button color="dark" component={Link} to="/flights">
            <Trans>Flight plan checker</Trans>
          </Button>
          <Button
            color="dark"
            component="a"
            href="https://community.vatprc.net"
            target="_blank"
            rel="noreferrer"
            rightSection={<TbExternalLink size={14} />}
          >
            <Trans>Forum</Trans>
          </Button>
        </div>
        <div className="flex gap-2 bg-black/70 px-4 py-2 font-mono">
          <HeroStat value={data?.pilots?.length ?? "--"} label={<Trans>Pilots online</Trans>} />
          <HeroStat value={data?.controllers?.length ?? "--"} label={<Trans>Controllers online</Trans>} />
          <HeroStat value={eventsThisWeek} label={<Trans>Events this week</Trans>} accent />
        </div>
      </div>
    </section>
  );
};
