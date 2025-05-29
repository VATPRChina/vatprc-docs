import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import { ThemeProvider, useThemeValue } from "@/components/theme-provider";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import { getPathname } from "@/lib/utils";
import appCss from "@/styles/app.css?url";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { useState } from "react";
import { TbExternalLink, TbLanguage } from "react-icons/tb";

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
          <Link className="item" to="/division/introduction">
            <h3>{m["Legacy_nav-menu_introduction"]()}</h3>
          </Link>
          <Link className="item" to="/division/staff">
            <h3>{m["Legacy_nav-menu_staff"]()}</h3>
          </Link>
          <Link className="item" to="/division/privacy">
            <h3>{m["Legacy_nav-menu_privacy"]()}</h3>
          </Link>
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
          <Link className="large-item row-span-4 flex items-end" to="/airspace/fir">
            {m["Legacy_nav-menu_fir"]()}
          </Link>
          <Link className="item" to="/airspace/rvsm">
            {m["Legacy_nav-menu_rvsm"]()}
          </Link>
          <Link className="item" to="/airspace/station">
            {m["Legacy_nav-menu_atc-positions-frequencies"]()}
          </Link>
          <Link className="item" to="/airspace/sop">
            {m["Legacy_nav-menu_sop"]()}
          </Link>
          <Link className="item" to="/airspace/vfr">
            {m["Legacy_nav-menu_vfr"]()}
          </Link>
        </div>
      ),
    },
    {
      title: m["Legacy_nav-menu_pilot"](),
      content: (
        <div className="nav-list-grid">
          <Link className="large-item row-span-2 flex items-end" to="/pilot/start-to-fly">
            {m["Legacy_nav-menu_start-to-fly"]()}
          </Link>
          <Link className="item" to="/pilot/introduction-to-fly">
            {m["Legacy_nav-menu_introduction-to-fly"]()}
          </Link>
          <Link className="item" to="/pilot/ts3">
            {m["Legacy_nav-menu_ts3"]()}
          </Link>
          <hr className="col-span-full" />
          <Link className="large-item row-span-3 flex items-end" to="/pilot/pilot-softwares">
            {m["Legacy_nav-menu_pilot-softwares"]()}
          </Link>
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
          <Link className="large-item row-span-3 flex items-end" to="/controller/controller-list">
            {m["Legacy_nav-menu_controller-list"]()}
          </Link>
          <Link className="item" to="/controller/controller-regulations">
            {m["Legacy_nav-menu_controller-regulations"]()}
          </Link>
          <Link className="item" to="/controller/become-a-controller">
            {m["Legacy_nav-menu_become-a-controller"]()}
          </Link>
          <Link className="item" to="/controller/visiting-and-transferring">
            {m["Legacy_nav-menu_visiting-and-transferring"]()}
          </Link>
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
          <Link className="item" to="/controller/sector">
            {m["Legacy_nav-menu_sector"]()}
          </Link>
          <Link className="item" to="/controller/loa">
            {m["Legacy_nav-menu_loa"]()}
          </Link>
        </ul>
      ),
    },
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {contents.map((content) => (
          <NavigationMenuItem key={content.title}>
            <NavigationMenuTrigger>{content.title}</NavigationMenuTrigger>
            <NavigationMenuContent asChild>{content.content}</NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

interface ApplicationProps {
  children?: React.ReactNode;
}

const Application: React.FC<ApplicationProps> = ({ children }: ApplicationProps) => {
  const theme = useThemeValue();

  const pathnameAnotherLang =
    getLocale() === "zh-cn" ? getPathname().replace("/zh-cn", "/en") : getPathname().replace("/en", "/zh-cn");

  return (
    <div className="container mx-auto">
      <header className="sticky top-0 z-50 w-full border-b-[1px] px-8 py-2 dark:border-slate-700 bg-background">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link to="/">
            <img src={theme === "light" ? logo : logoWhite} alt={m["Legacy_title"]()} className="h-6" />
          </Link>
          <NavMenu />
          <div className="flex flex-row items-center gap-4 absolute right-8 top-2 ml-auto md:static md:right-auto md:top-auto">
            <ModeToggle />
            <Button variant="ghost" size="icon" asChild>
              <a href={pathnameAnotherLang} className="cursor-default">
                <TbLanguage size={18} />
              </a>
            </Button>
          </div>
        </div>
      </header>
      <div className="pt-4">{children}</div>
      <footer className="mb-4 mt-8">
        <p className="text-slate-500 dark:text-slate-300">&copy; {m["Layout_copyright"]()}</p>
      </footer>
    </div>
  );
};

const RootLayout: React.FC = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <html lang={getLocale() ?? "en"}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="vatprc-ui-theme">
          <QueryClientProvider client={queryClient}>
            <Application>
              <Outlet />
            </Application>
          </QueryClientProvider>
        </ThemeProvider>
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
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: rehypeCssUrl },
    ],
  }),
  component: RootLayout,
});
