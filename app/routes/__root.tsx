import stylesheetUrl from "./__root.css?url";
import logo from "@/assets/logo_standard.svg";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import { HoverCard, Portal } from "@ark-ui/react";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { TbExternalLink } from "react-icons/tb";

const NavMenu: React.FC = () => {
  const contents = [
    {
      title: m["Legacy_nav-menu_about"](),
      content: (
        <div className="nav-list-grid">
          <a
            className="large-item row-span-4 flex items-end"
            href="https://community.vatprc.net/c/69-category/12-category/12"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-2">
              {m["Legacy_nav-menu_announcement"]()}
              <TbExternalLink size={12} />
            </div>
          </a>
          <a className="item" href="/division/introduction">
            <h3>{m["Legacy_nav-menu_introduction"]()}</h3>
          </a>
          <a className="item" href="/division/staff">
            <h3>{m["Legacy_nav-menu_staff"]()}</h3>
          </a>
          <a className="item" href="/division/privacy">
            <h3>{m["Legacy_nav-menu_privacy"]()}</h3>
          </a>
          <a
            className="item"
            href="https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-2">
              {m["Legacy_nav-menu_logo-pack"]()}
              <TbExternalLink size={12} />
            </div>
          </a>
          <hr className="col-span-full" />
          <a className="large-item" href="https://community.vatprc.net" target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-2">
              {m["Legacy_nav-menu_forum"]()}
              <TbExternalLink size={12} />
            </div>
          </a>
          <a
            className="large-item"
            href={
              getLocale() === "zh-cn"
                ? "https://community.vatprc.net/c/events/66-category/66"
                : "https://vatsim.net/events/"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-2">
              {m["Legacy_nav-menu_event"]()}
              <TbExternalLink size={12} />
            </div>
          </a>
        </div>
      ),
    },
    {
      title: m["Legacy_nav-menu_operation"](),
      content: (
        <div className="nav-list-grid">
          <a className="large-item row-span-4 flex items-end" href="/airspace/fir">
            {m["Legacy_nav-menu_fir"]()}
          </a>
          <a className="item" href="/airspace/rvsm">
            {m["Legacy_nav-menu_rvsm"]()}
          </a>
          <a className="item" href="/airspace/station">
            {m["Legacy_nav-menu_atc-positions-frequencies"]()}
          </a>
          <a className="item" href="/airspace/sop">
            {m["Legacy_nav-menu_sop"]()}
          </a>
          <a className="item" href="/airspace/vfr">
            {m["Legacy_nav-menu_vfr"]()}
          </a>
        </div>
      ),
    },
    {
      title: m["Legacy_nav-menu_pilot"](),
      content: (
        <div className="nav-list-grid">
          <a className="large-item row-span-2 flex items-end" href="/pilot/start-to-fly">
            {m["Legacy_nav-menu_start-to-fly"]()}
          </a>
          <a className="item" href="/pilot/introduction-to-fly">
            {m["Legacy_nav-menu_introduction-to-fly"]()}
          </a>
          <a className="item" href="/pilot/ts3">
            {m["Legacy_nav-menu_ts3"]()}
          </a>
          <hr className="col-span-full" />
          <a className="large-item row-span-3 flex items-end" href="/pilot/pilot-softwares">
            {m["Legacy_nav-menu_pilot-softwares"]()}
          </a>
          <a
            className="item flex items-center gap-2"
            href="https://chartfox.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {m["Legacy_nav-menu_charts"]()}
            <TbExternalLink size={12} />
          </a>
          <a
            className="item flex items-center gap-2"
            href="https://vacdm.vatprc.net/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {m["Legacy_nav-menu_vacdm"]()}
            <TbExternalLink size={12} />
          </a>
          <a
            className="item flex items-center gap-2"
            href="https://metar-taf.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {m["Legacy_nav-menu_weather"]()}
            <TbExternalLink size={12} />
          </a>
        </div>
      ),
    },
    {
      title: m["Legacy_nav-menu_atc"](),
      content: (
        <ul className="nav-list-grid">
          <a className="large-item row-span-3 flex items-end" href="/controller/controller-list">
            {m["Legacy_nav-menu_controller-list"]()}
          </a>
          <a className="item" href="/controller/controller-regulations">
            {m["Legacy_nav-menu_controller-regulations"]()}
          </a>
          <a className="item" href="/controller/become-a-controller">
            {m["Legacy_nav-menu_become-a-controller"]()}
          </a>
          <a className="item" href="/controller/visiting-and-transferring">
            {m["Legacy_nav-menu_visiting-and-transferring"]()}
          </a>
          <hr className="col-span-full" />
          <a
            className="large-item row-span-3 flex items-end"
            href="https://atc.vatprc.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-2">
              {m["Legacy_nav-menu_atc-center"]()}
              <TbExternalLink size={12} />
            </div>
          </a>
          <a
            className="item flex items-center gap-2"
            href="https://moodle.vatprc.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            {m["Legacy_nav-menu_moodle"]()}
            <TbExternalLink size={12} />
          </a>
          <a className="item" href="/controller/sector">
            {m["Legacy_nav-menu_sector"]()}
          </a>
          <a className="item" href="/controller/loa">
            {m["Legacy_nav-menu_loa"]()}
          </a>
        </ul>
      ),
    },
  ];

  return contents.map((content) => (
    <li key={content.title}>
      <HoverCard.Root openDelay={50} closeDelay={100}>
        <HoverCard.Trigger asChild>
          <button className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-red-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-red-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
            {content.title}
          </button>
        </HoverCard.Trigger>
        <Portal>
          <HoverCard.Positioner>
            <HoverCard.Content asChild>
              <div className="z-10 bg-white rounded-lg border border-gray-300 dark:border-gray-500 dark:bg-gray-900 transition">
                {content.content}
              </div>
            </HoverCard.Content>
          </HoverCard.Positioner>
        </Portal>
      </HoverCard.Root>
    </li>
  ));
};

interface ApplicationProps {
  children?: React.ReactNode;
}

const Application: React.FC<ApplicationProps> = ({ children }: ApplicationProps) => {
  return (
    <>
      <nav className="bg-white border-gray-200 dark:border-gray-700 dark:bg-gray-900 sticky top-0 z-5 border-b h-16">
        <div className="flex flex-wrap items-center justify-between p-4">
          <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src={logo} className="h-8" alt="VATPRC Logo" />
          </a>
          <div className="flex items-center md:order-2 space-x-1 md:space-x-0 rtl:space-x-reverse">
            <ColorSchemeToggle />
          </div>
          <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-language">
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <NavMenu />
            </ul>
          </div>
        </div>
      </nav>
      <div className="pt-4">{children}</div>
      <footer className="mb-4 mt-8">
        <p className="text-slate-500 dark:text-slate-300">&copy; {m.Layout_copyright()}</p>
      </footer>
    </>
  );
};

const RootLayout: React.FC = () => {
  return (
    <html lang={getLocale() ?? "en"} className="scroll-pt-16">
      <head>
        <HeadContent />
      </head>
      <body className="container mx-auto dark:bg-gray-900">
        <Application>
          <Outlet />
        </Application>
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "VATSIM P.R. China Division" },
    ],
    links: [
      { rel: "stylesheet", href: stylesheetUrl },
      { rel: "stylesheet", href: rehypeCssUrl },
    ],
  }),
  component: RootLayout,
});
