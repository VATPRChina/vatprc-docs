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
import { getLocale, getLocalPathname } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import appCss from "@/styles/app.css?url";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { I18nProvider } from "@lingui/react";
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

const contents = [
  {
    title: msg`About Us`.message,
    content: (
      <ul className="nav-list-grid">
        <NavMenuLink
          href="https://community.vatprc.net/c/69-category/12-category/12"
          large
          external
          className="row-span-4"
        >
          Announcement
        </NavMenuLink>
        <NavMenuLink href="/division/introduction">Introduction</NavMenuLink>
        <NavMenuLink href="/division/staff">Staff</NavMenuLink>
        <NavMenuLink href="/division/privacy">Privacy Policy</NavMenuLink>
        <NavMenuLink href="https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip" external>
          Logo Pack
        </NavMenuLink>
        <NavMenuLink href="/division/meeting">Meeting Notes</NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="https://community.vatprc.net" external>
          Forum
        </NavMenuLink>
        <NavMenuLink
          href={
            getLocale() === "zh-cn"
              ? "https://community.vatprc.net/c/events/66-category/66"
              : "https://vatsim.net/events/"
          }
          external
        >
          Event
        </NavMenuLink>
        <NavMenuLink href="/division/api" external>
          API Document
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: "Operation",
    content: (
      <ul className="nav-list-grid">
        <NavMenuLink href="/airspace/fir" large className="row-span-4">
          Airspace
        </NavMenuLink>
        <NavMenuLink href="/airspace/rvsm">China RVSM</NavMenuLink>
        <NavMenuLink href="/airspace/station">ATC Positions & Frequencies</NavMenuLink>
        <NavMenuLink href="/airspace/sop">Standard Operation Procedures</NavMenuLink>
        <NavMenuLink href="/airspace/vfr">VFR Policy</NavMenuLink>
      </ul>
    ),
  },
  {
    title: "Pilots",
    content: (
      <ul className="nav-list-grid">
        <NavMenuLink href="/pilot/start-to-fly" large className="row-span-2">
          Start to Fly
        </NavMenuLink>
        <NavMenuLink href="/pilot/introduction-to-fly">Introduction to Fly</NavMenuLink>
        <NavMenuLink href="/pilot/ts3">Community & Teamspeak 3</NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="/pilot/pilot-softwares" large className="row-span-3">
          Pilot Softwares
        </NavMenuLink>
        <NavMenuLink href="https://chartfox.org/">Charts</NavMenuLink>
        <NavMenuLink href="https://vacdm.vatprc.net/">vACDM</NavMenuLink>
        <NavMenuLink href="https://metar-taf.com/">Weather</NavMenuLink>
        <NavMenuLink href="/flights">
          Flight plan checker
          <Badge className="ml-2 rounded-full" variant="destructive">
            New
          </Badge>
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: "Controllers",
    content: (
      <ul className="nav-list-grid">
        <NavMenuLink href="/controller/controller-list" large className="row-span-3">
          Controller List
        </NavMenuLink>
        <NavMenuLink href="/controller/controller-regulations">Progression Guide</NavMenuLink>
        <NavMenuLink href="/controller/become-a-controller">Become a Controller</NavMenuLink>
        <NavMenuLink href="/controller/visiting-and-transferring">Visiting & Transfer</NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="https://atc.vatprc.net" large external className="row-span-3">
          ATC Center
        </NavMenuLink>
        <NavMenuLink href="https://moodle.vatprc.net" external>
          Moodle
        </NavMenuLink>
        <NavMenuLink href="/controller/sector">Sector Files</NavMenuLink>
        <NavMenuLink href="/controller/loa">Letter of Agreement</NavMenuLink>
      </ul>
    ),
  },
];

export const NavMenu: React.FC = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {contents.map((content) => (
          <NavigationMenuItem key={content.title}>
            <NavigationMenuTrigger>{content.title}</NavigationMenuTrigger>
            <NavigationMenuContent>{content.content}</NavigationMenuContent>
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
            <img src={theme === "light" ? logo : logoWhite} alt="VATSIM P.R.China Division" className="h-6" />
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
        <p className="text-slate-500 dark:text-slate-300">
          &copy; 2010 - 2025, VATSIM P.R. China Division. All rights reserved. Powered by Microsoft Azure, .NET,
          TanStack and shadcn/ui. For simulation use only.
        </p>
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
            <I18nProvider i18n={i18n}>
              <Application>
                <Outlet />
              </Application>
            </I18nProvider>
          </QueryClientProvider>
        </ThemeProvider>
        <Toaster position="top-center" />
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: (ctx) => {
    const pathname = ctx.matches[ctx.matches.length - 1].pathname;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { title: "VATSIM P.R. China Division" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "stylesheet", href: rehypeCssUrl },
        { rel: "alternate", hrefLang: "en", href: getLocalPathname(pathname, "en") },
        { rel: "alternate", hrefLang: "zh-cn", href: getLocalPathname(pathname, "zh-cn") },
      ],
    };
  },
  component: RootLayout,
});
