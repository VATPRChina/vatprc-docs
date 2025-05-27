import drone from "@/assets/legacy/drone.png";
import feedback from "@/assets/legacy/feedback.png";
import laptop from "@/assets/legacy/lap_top.png";
import pilot from "@/assets/legacy/pilot.png";
import { m } from "@/lib/i18n/messages";
import { getPathname } from "@/lib/util";
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
  // @ts-expect-error Allow any
  // eslint-disable-next-line
  const t = (s: string) => m["Legacy_" + s.replaceAll(".", "_")]();

  return (
    <div className="flex flex-col items-center dark:text-white">
      <div className="xl:max-w-80vw 2xl:max-w-65vw 3xl:max-w-45vw w-full">
        <section className="px flex w-full flex-row items-center justify-center py-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="pxy flex flex-col items-center justify-center">
              <h1 className="home-font m-2 text-4xl font-medium">{t("title")}</h1>
              <h2 className="home-font m-2 text-3xl font-medium">{t("subtitle")}</h2>
            </div>
            <div className="pxy flex flex-col items-center justify-center">
              <img src={pilot} alt="Pilot" />
            </div>
          </div>
        </section>
        <section className="py-18 px flex w-full flex-col items-center justify-center">
          <h3 className="text-4xl">{t("recent-events")}</h3>
          {/* <RecentEvents className="my-8 w-full" /> */}
        </section>
        <section className="px flex w-full flex-row items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <img className="flex w-1/2" src={laptop} alt="laptop" />
            </div>
            <div className="flex flex-col items-center justify-center py-9">
              <h3 className="mb-8 text-4xl">{t("online-controllers")}</h3>
              {/* <OnlineControllers /> */}
              <a
                href="https://atc.vatprc.net"
                target="_blank"
                rel="noopener noreferrer"
                className="vatprc-big-btn-reverse mt-6"
              >
                {t("nav-menu.atc-center")}
                <TbArrowRight className="-mt-0.5 ml-2" size={24} />
              </a>
            </div>
            <div className="flex flex-col items-center justify-center sm:hidden">
              <img className="flex w-1/2" src={laptop} alt="laptop" />
            </div>
          </div>
        </section>
        <section className="px pt-18 flex w-full flex-row items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center py-9">
              <h3 className="mb-8 text-4xl">{t("online-pilots")}</h3>
              {/* <OnlinePilots className="my-auto" /> */}
            </div>
            <div className="flex flex-col items-center justify-center">
              <img className="flex w-1/2" src={drone} alt="Drone" />
            </div>
          </div>
        </section>
        <section className="px pt-18 flex w-full flex-row items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="hidden flex-col items-center justify-center md:flex">
              <img className="flex w-1/2" src={feedback} alt="Feedback" />
            </div>
            <div className="flex flex-col items-center justify-center py-9">
              <h3 className="mb-8 text-4xl">{t("feedback")}</h3>
              <p className="text-center">{t("feedback-description")}</p>
              <a
                href="mailto:feedback@vatprc.net"
                target="_blank"
                rel="noopener noreferrer"
                className="vatprc-big-btn-reverse mt-6"
              >
                <TbMail className="mr-2" height={24} />
                feedback@vatprc.net
              </a>
              <a
                href="https://community.vatprc.net"
                target="_blank"
                rel="noopener noreferrer"
                className="vatprc-big-btn-reverse mt-6"
              >
                {t("nav-menu.forum")}
                <TbArrowRight className="-mt-0.5 ml-2" height={24} />
              </a>
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
