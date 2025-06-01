import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeProvider, useThemeValue } from "@/components/theme-provider";
import { ModeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Toaster } from "@/components/ui/sonner";
import { getLocalPathname } from "@/lib/i18n";
import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import { cn } from "@/lib/utils";
import appCss from "@/styles/app.css?url";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import { NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { TbExternalLink } from "react-icons/tb";

interface NavigationMenuLinkProps {
  large?: boolean;
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}
const NavMenuLink: React.FC<NavigationMenuLinkProps> = (props: NavigationMenuLinkProps) => {
  const { large, href, external, children, className } = props;

  const cnLink = large ? "large-item flex items-end" : "item";
  const inner = (
    <h3 className={cn(external && "flex items-center gap-2")}>
      {children}
      {external && <TbExternalLink size={12} />}
    </h3>
  );

  const link = external ? (
    <a role="listitem" className={cn(cnLink, className)} href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link role="listitem" className={cn(cnLink, className)} to={href}>
      {inner}
    </Link>
  );

  return <NavigationMenuLink asChild>{link}</NavigationMenuLink>;
};

const NavMenu: React.FC = () => {
  const contents = [
    {
      title: m["Legacy_nav-menu_about"](),
      content: (
        <ul className="nav-list-grid">
          <NavMenuLink
            href="https://community.vatprc.net/c/69-category/12-category/12"
            large
            external
            className="row-span-4"
          >
            {m["Legacy_nav-menu_announcement"]()}
          </NavMenuLink>
          <NavMenuLink href="/division/introduction">{m["Legacy_nav-menu_introduction"]()}</NavMenuLink>
          <NavMenuLink href="/division/staff">{m["Legacy_nav-menu_staff"]()}</NavMenuLink>
          <NavMenuLink href="/division/privacy">{m["Legacy_nav-menu_privacy"]()}</NavMenuLink>
          <NavMenuLink href="https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip" external>
            {m["Legacy_nav-menu_logo-pack"]()}
          </NavMenuLink>
          <hr className="col-span-full" />
          <NavMenuLink href="https://community.vatprc.net" external>
            {m["Legacy_nav-menu_forum"]()}
          </NavMenuLink>
          <NavMenuLink
            href={
              getLocale() === "zh-cn"
                ? "https://community.vatprc.net/c/events/66-category/66"
                : "https://vatsim.net/events/"
            }
            external
          >
            {m["Legacy_nav-menu_event"]()}
          </NavMenuLink>
          <NavMenuLink href="/division/api" external>
            {m["nav_menu_division_api"]()}
          </NavMenuLink>
        </ul>
      ),
    },
    {
      title: m["Legacy_nav-menu_operation"](),
      content: (
        <ul className="nav-list-grid">
          <NavMenuLink href="/airspace/fir" large className="row-span-4">
            {m["Legacy_nav-menu_fir"]()}
          </NavMenuLink>
          <NavMenuLink href="/airspace/rvsm">{m["Legacy_nav-menu_rvsm"]()}</NavMenuLink>
          <NavMenuLink href="/airspace/station">{m["Legacy_nav-menu_atc-positions-frequencies"]()}</NavMenuLink>
          <NavMenuLink href="/airspace/sop">{m["Legacy_nav-menu_sop"]()}</NavMenuLink>
          <NavMenuLink href="/airspace/vfr">{m["Legacy_nav-menu_vfr"]()}</NavMenuLink>
        </ul>
      ),
    },
    {
      title: m["Legacy_nav-menu_pilot"](),
      content: (
        <ul className="nav-list-grid">
          <NavMenuLink href="/pilot/start-to-fly" large className="row-span-2">
            {m["Legacy_nav-menu_start-to-fly"]()}
          </NavMenuLink>
          <NavMenuLink href="/pilot/introduction-to-fly">{m["Legacy_nav-menu_introduction-to-fly"]()}</NavMenuLink>
          <NavMenuLink href="/pilot/ts3">{m["Legacy_nav-menu_ts3"]()}</NavMenuLink>
          <hr className="col-span-full" />
          <NavMenuLink href="/pilot/pilot-softwares" large className="row-span-3">
            {m["Legacy_nav-menu_pilot-softwares"]()}
          </NavMenuLink>
          <NavMenuLink href="https://chartfox.org/">{m["Legacy_nav-menu_charts"]()}</NavMenuLink>
          <NavMenuLink href="https://vacdm.vatprc.net/">{m["Legacy_nav-menu_vacdm"]()}</NavMenuLink>
          <NavMenuLink href="https://metar-taf.com/">{m["Legacy_nav-menu_weather"]()}</NavMenuLink>
          <NavMenuLink href="/flights">
            {m["layout_navmenu_fpl_checker"]()}
            <Badge className="ml-2 rounded-full" variant="destructive">
              New
            </Badge>
          </NavMenuLink>
        </ul>
      ),
    },
    {
      title: m["Legacy_nav-menu_atc"](),
      content: (
        <ul className="nav-list-grid">
          <NavMenuLink href="/controller/controller-list" large className="row-span-3">
            {m["Legacy_nav-menu_controller-list"]()}
          </NavMenuLink>
          <NavMenuLink href="/controller/controller-regulations">
            {m["Legacy_nav-menu_controller-regulations"]()}
          </NavMenuLink>
          <NavMenuLink href="/controller/become-a-controller">{m["Legacy_nav-menu_become-a-controller"]()}</NavMenuLink>
          <NavMenuLink href="/controller/visiting-and-transferring">
            {m["Legacy_nav-menu_visiting-and-transferring"]()}
          </NavMenuLink>
          <hr className="col-span-full" />
          <NavMenuLink href="https://atc.vatprc.net" large external className="row-span-3">
            {m["Legacy_nav-menu_atc-center"]()}
          </NavMenuLink>
          <NavMenuLink href="https://moodle.vatprc.net" external>
            {m["Legacy_nav-menu_moodle"]()}
          </NavMenuLink>
          <NavMenuLink href="/controller/sector">{m["Legacy_nav-menu_sector"]()}</NavMenuLink>
          <NavMenuLink href="/controller/loa">{m["Legacy_nav-menu_loa"]()}</NavMenuLink>
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
  const route = useRouterState();
  if (route.location.pathname === "/division/api") {
    return children;
  }

  return (
    <div className="container mx-auto">
      <header className="bg-background sticky top-0 z-50 w-full border-b-[1px] px-8 py-2">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Link to="/">
            <img src={theme === "light" ? logo : logoWhite} alt={m["Legacy_title"]()} className="h-6" />
          </Link>
          <NavMenu />
          <div className="absolute top-2 right-8 ml-auto flex flex-row items-center gap-4 md:static md:top-auto md:right-auto">
            <ModeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>
      <div className="pt-4">{children}</div>
      <footer className="mt-8 mb-4">
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

  const route = useRouterState();

  return (
    <html lang={getLocale() ?? "en"} className={cn(route.location.pathname !== "/division/api" && "scroll-pt-16")}>
      <head>
        <HeadContent />
      </head>
      <body className="px-1 md:px-0">
        <ThemeProvider defaultTheme="light" storageKey="vatprc-ui-theme">
          <QueryClientProvider client={queryClient}>
            <Application>
              <Outlet />
            </Application>
          </QueryClientProvider>
        </ThemeProvider>
        <Toaster position="top-center" />
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: (ctx) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "VATSIM P.R. China Division" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: rehypeCssUrl },
      { rel: "alternate", hreflang: "en", href: getLocalPathname(ctx.match.pathname, "en") },
      { rel: "alternate", hreflang: "zh-cn", href: getLocalPathname(ctx.match.pathname, "zh-cn") },
    ],
  }),
  component: RootLayout,
});
