import heroImage from "@/assets/homepage/hero.jpg";
import { $api } from "@/lib/client";
import { useNewNavigationFlag } from "@/lib/experimental-features";
import { Alert, Button, Card } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { isSameWeek, parseISO } from "date-fns";
import React from "react";

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
  const enableNewNav = useNewNavigationFlag();

  const { data, error: statusError } = $api.useQuery("get", "/api/compat/online-status");
  const { data: events, error: eventsError } = $api.useQuery("get", "/api/events");
  const eventsThisWeek =
    events?.filter((e) => isSameWeek(parseISO(e.start_at), Date.now(), { weekStartsOn: 1 })).length ?? 0;

  if (enableNewNav) return <HeroV2 />;

  return (
    <section data-homepage-hero className="relative w-full overflow-hidden">
      <img src={heroImage} aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-[50px]" />
      <div className="absolute inset-0">
        <div className="relative mx-auto h-full w-full max-w-336 mask-[linear-gradient(to_right,transparent,black_max(0px,calc((100%-72rem)/2)),black_calc(100%-max(0px,calc((100%-72rem)/2))),transparent)]">
          <img src={heroImage} aria-hidden className="h-full w-full scale-105 object-cover blur-[3px]" />
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/60 to-transparent" />
      <div className="relative mx-auto flex max-h-svh min-h-112 w-full max-w-6xl flex-col items-start justify-center gap-4 px-4 pt-28 pb-16">
        {(statusError ?? eventsError) && (
          <Alert color="red" title={(statusError ?? eventsError)?.title}>
            {(statusError ?? eventsError)?.detail}
          </Alert>
        )}
        <div className="flex flex-col items-start gap-2">
          <h1 className="px-4 py-2 text-3xl font-medium text-white backdrop-blur-xl md:text-4xl">
            <Trans>VATSIM P.R. China Division · VATPRC</Trans>
          </h1>
          <p className="px-4 py-2 text-xl font-medium text-white italic backdrop-blur-xl">
            <Trans>
              <b>VATPRC 有你更精彩</b>
              <br />
              You make the difference!
            </Trans>
          </p>
        </div>
        <div className="grid w-fit grid-cols-2 gap-1">
          {/* <Button component={Link} to="/controllers">
            <Trans>Join the controller team</Trans>
          </Button>
          <Button component={Link} to="/pilot/introduction-to-fly">
            <Trans>How to fly</Trans>
          </Button>
          <Button component={Link} to="/flights">
            <Trans>Flight plan checker</Trans>
          </Button>
          <Button
            render={(props) => <a href="https://community.vatprc.net" target="_blank" rel="noreferrer" {...props} />}
          >
            <Trans>Forum</Trans>
          </Button> */}
        </div>
        <div className="flex gap-2 px-4 py-2 font-mono backdrop-blur-xl">
          <HeroStat value={data?.pilots?.length ?? "--"} label={<Trans>Pilots online</Trans>} />
          <HeroStat value={data?.controllers?.length ?? "--"} label={<Trans>Controllers online</Trans>} />
          <HeroStat value={eventsThisWeek} label={<Trans>Events this week</Trans>} accent />
        </div>
      </div>
    </section>
  );
};

export const HeroV2: React.FC = () => {
  return (
    <section className="container mx-auto mt-4">
      <div className="flex items-center">
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-5xl font-bold">
            <Trans>
              Virtual aviation community
              <br />
              For China mainland
            </Trans>
          </h2>
          <h1 className="text-3xl">
            <Trans>VATSIM P.R. China division</Trans>
          </h1>
          <div className="flex w-fit flex-col gap-2">
            <h2 className="text-2xl font-medium">
              <Trans>What do you want to do today?</Trans>
            </h2>
            <Card>
              <Card.Footer className="mx-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    <Trans>Fly</Trans>
                  </div>
                  <div className="text-xs">
                    <Trans>Enjoy Air</Trans>
                  </div>
                </div>
                <div className="ml-8 flex gap-2">
                  <Button size="sm" variant="tertiary">
                    <Trans>My Flight</Trans>
                  </Button>
                  <Button size="sm" variant="tertiary">
                    <Trans>Learning Hub</Trans>
                  </Button>
                </div>
              </Card.Footer>
            </Card>
            <Card>
              <Card.Footer className="mx-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    <Trans>Control</Trans>
                  </div>
                  <div className="text-xs">
                    <Trans>Help Pilots</Trans>
                  </div>
                </div>
                <div className="ml-8 flex gap-2">
                  <Button size="sm" variant="tertiary">
                    <Trans>ATC Center</Trans>
                  </Button>
                  <Button size="sm" variant="tertiary">
                    <Trans>Moodle</Trans>
                  </Button>
                </div>
              </Card.Footer>
            </Card>
            <Card>
              <Card.Footer className="mx-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    <Trans>Communicate</Trans>
                  </div>
                  <div className="text-xs">
                    <Trans>Chat, Learn, Share with community</Trans>
                  </div>
                </div>
                <div className="ml-8 flex gap-2">
                  <Button size="sm" variant="tertiary">
                    <Trans>Forum</Trans>
                  </Button>
                  <Button size="sm" variant="tertiary">
                    <Trans>Discord</Trans>
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </div>
        </div>
        <div className="flex-1">
          <img src={heroImage} className="aspect-square rounded-4xl object-cover shadow-2xl" />
        </div>
      </div>
    </section>
  );
};
