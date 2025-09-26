import drone from "@/assets/legacy/drone.png";
import feedback from "@/assets/legacy/feedback.png";
import laptop from "@/assets/legacy/lap_top.png";
import pilot from "@/assets/legacy/pilot.png";
import { OnlineControllers } from "@/components/online-controllers";
import { OnlinePilots } from "@/components/online-pilots";
import { RecentEvents } from "@/components/recent-events";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { TbArrowRight, TbMail } from "react-icons/tb";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const IndexWithLocale: React.FC = () => {
  const { t } = useLingui();

  return (
    <div className="container mx-auto">
      <section className="px flex w-full flex-row items-center justify-center py-12 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="pxy flex flex-col items-center justify-center">
            <h1 className="home-font m-2 text-4xl font-medium">
              <Trans>VATSIM P.R.China Division</Trans>
            </h1>
            <h2 className="home-font m-2 text-3xl font-medium">
              <Trans>VATPRC</Trans>
            </h2>
          </div>
          <div className="pxy flex flex-col items-center justify-center">
            <img src={pilot} alt={t`Pilot`} />
          </div>
        </div>
      </section>
      <section className="px flex w-full flex-col items-center justify-center py-18">
        <h3 className="mb-8 text-4xl">
          <Trans>Recent Events</Trans>
        </h3>
        <RecentEvents className="w-full" />
      </section>
      <section className="px flex w-full flex-row items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <img className="flex w-1/2" src={laptop} alt="laptop" />
          </div>
          <div className="flex flex-col items-center justify-center py-9">
            <h3 className="mb-8 text-4xl">
              <Trans>Online Controllers</Trans>
            </h3>
            <OnlineControllers />
            <Button
              component="a"
              variant="subtle"
              className="vatprc-big-btn-reverse mt-6"
              href="https://atc.vatprc.net"
              target="_blank"
              rel="noreferrer"
            >
              <Trans>ATC Center</Trans>
              <TbArrowRight className="-mt-0.5 ml-2" size={24} />
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center sm:hidden">
            <img className="flex w-1/2" src={laptop} alt="laptop" />
          </div>
        </div>
      </section>
      <section className="px flex w-full flex-row items-center justify-center pt-18">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center py-9">
            <h3 className="mb-8 text-4xl">
              <Trans>Online Pilots</Trans>
            </h3>
            <OnlinePilots className="my-auto" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <img className="flex w-1/2" src={drone} alt="Drone" />
          </div>
        </div>
      </section>
      <section className="px flex w-full flex-row items-center justify-center pt-18">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="hidden flex-col items-center justify-center md:flex">
            <img className="flex w-1/2" src={feedback} alt={t`Feedback`} />
          </div>
          <div className="flex flex-col items-center justify-center py-9">
            <h3 className="mb-8 text-4xl">
              <Trans>Feedback</Trans>
            </h3>
            <p className="text-center">
              <Trans>
                Appreciation? Compliment? Criticism? You are welcome to provide feedback to the staff team via email or
                join the discussion on our forum!
              </Trans>
            </p>
            <Button
              component="a"
              variant="subtle"
              href="mailto:feedback@vatprc.net"
              target="_blank"
              rel="noreferrer"
              className="vatprc-big-btn-reverse mt-6"
            >
              <TbMail className="mr-2" height={24} />
              feedback@vatprc.net
            </Button>
            <Button
              component="a"
              variant="subtle"
              href="https://community.vatprc.net"
              target="_blank"
              rel="noreferrer"
              className="vatprc-big-btn-reverse mt-6"
            >
              <Trans>Forum</Trans>
              <TbArrowRight className="-mt-0.5 ml-2" height={24} />
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center sm:hidden">
            <img className="flex w-1/2" src={feedback} alt={t`Feedback`} />
          </div>
        </div>
      </section>
      <section className="flex w-full flex-row items-center justify-center text-center">
        <div className="color-vatprc-red home-font py-16 text-2xl font-medium italic">
          <Trans>
            <b>VATPRC 有你更精彩</b>
            <br />
            You make the difference!
          </Trans>
        </div>
      </section>
    </div>
  );
};

const IndexWithoutLocale: React.FC = () => {
  useEffect(() => {
    if (localStorage.getItem("vatprc-homepage-locale")) {
      window.location.replace(`/${localStorage.getItem("vatprc-homepage-locale")}`);
      return;
    }
    let useChinese = false;
    if (navigator.language.toLowerCase().startsWith("zh")) {
      useChinese = true;
    }
    for (const language of navigator.languages) {
      if (language.toLowerCase().startsWith("en")) {
        break;
      } else if (language.toLowerCase().startsWith("zh")) {
        useChinese = true;
        break;
      }
    }
    if (useChinese) {
      window.location.replace("/zh-cn");
    } else {
      window.location.replace("/en");
    }
  });

  return (
    <div className="grid h-screen place-items-center">
      <div className="flex flex-col items-center gap-4">
        <p className="text-3xl">Redirecting to landing page.</p>
        <p className="text-3xl">正在重定向到首页。</p>
        <p className="flex flex-row gap-8 text-xl text-slate-700 underline">
          <a href="/zh-cn">简体中文</a>
          <a href="/en">English</a>
        </p>
      </div>
    </div>
  );
};

function RouteComponent() {
  const {
    location: { pathname },
  } = useRouterState();

  if (pathname.startsWith("/en") || pathname.startsWith("/zh-cn")) {
    return <IndexWithLocale />;
  }
  return <IndexWithoutLocale />;
}
