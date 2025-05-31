import drone from "@/assets/legacy/drone.png";
import feedback from "@/assets/legacy/feedback.png";
import laptop from "@/assets/legacy/lap_top.png";
import pilot from "@/assets/legacy/pilot.png";
import { OnlineControllers } from "@/components/online-controllers";
import { OnlinePilots } from "@/components/online-pilots";
import { RecentEvents } from "@/components/recent-events";
import { Button } from "@/components/ui/button";
import { m } from "@/lib/i18n/messages";
import { getPathname } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { TbArrowRight, TbMail } from "react-icons/tb";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
});

const IndexWithLocale: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="xl:max-w-80vw 2xl:max-w-65vw 3xl:max-w-45vw w-full">
        <section className="px flex w-full flex-row items-center justify-center py-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="pxy flex flex-col items-center justify-center">
              <h1 className="home-font m-2 text-4xl font-medium">{m["Legacy_title"]()}</h1>
              <h2 className="home-font m-2 text-3xl font-medium">{m["Legacy_subtitle"]()}</h2>
            </div>
            <div className="pxy flex flex-col items-center justify-center">
              <img src={pilot} alt="Pilot" />
            </div>
          </div>
        </section>
        <section className="px flex w-full flex-col items-center justify-center py-18">
          <h3 className="mb-8 text-4xl">{m["Legacy_recent-events"]()}</h3>
          <RecentEvents className="w-full" />
        </section>
        <section className="px flex w-full flex-row items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <img className="flex w-1/2" src={laptop} alt="laptop" />
            </div>
            <div className="flex flex-col items-center justify-center py-9">
              <h3 className="mb-8 text-4xl">{m["Legacy_online-controllers"]()}</h3>
              <OnlineControllers />
              <Button asChild variant="ghost">
                <a
                  href="https://atc.vatprc.net"
                  target="_blank"
                  className="vatprc-big-btn-reverse mt-6"
                  rel="noreferrer"
                >
                  {m["Legacy_nav-menu_atc-center"]()}
                  <TbArrowRight className="-mt-0.5 ml-2" size={24} />
                </a>
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
              <h3 className="mb-8 text-4xl">{m["Legacy_online-pilots"]()}</h3>
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
              <img className="flex w-1/2" src={feedback} alt="Feedback" />
            </div>
            <div className="flex flex-col items-center justify-center py-9">
              <h3 className="mb-8 text-4xl">{m["Legacy_feedback"]()}</h3>
              <p className="text-center">{m["Legacy_feedback-description"]()}</p>
              <Button asChild variant="ghost">
                <a
                  href="mailto:feedback@vatprc.net"
                  target="_blank"
                  className="vatprc-big-btn-reverse mt-6"
                  rel="noreferrer"
                >
                  <TbMail className="mr-2" height={24} />
                  feedback@vatprc.net
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a
                  href="https://community.vatprc.net"
                  target="_blank"
                  className="vatprc-big-btn-reverse mt-6"
                  rel="noreferrer"
                >
                  {m["Legacy_nav-menu_forum"]()}
                  <TbArrowRight className="-mt-0.5 ml-2" height={24} />
                </a>
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center sm:hidden">
              <img className="flex w-1/2" src={feedback} alt="Feedback" />
            </div>
          </div>
        </section>
        <section className="flex w-full flex-row items-center justify-center text-center">
          <div className="color-vatprc-red home-font py-16 text-2xl font-medium italic">
            <b>VATPRC 有你更精彩</b>
            <br />
            You make the difference!
          </div>
        </section>
      </div>
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
  if (getPathname().startsWith("/en") || getPathname().startsWith("/zh-cn")) {
    return <IndexWithLocale />;
  }
  return <IndexWithoutLocale />;
}
