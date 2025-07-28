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
import { UserInfo } from "@/components/user-info";
import { useLocale, getLocalPathname } from "@/lib/i18n";
import { MyRouterContext } from "@/lib/route-context";
import { cn } from "@/lib/utils";
import appCss from "@/styles/app.css?url";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import { Trans, useLingui } from "@lingui/react/macro";
import { NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import { createRootRouteWithContext, HeadContent, Link, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
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
    title: <Trans>About Us</Trans>,
    content: ({ locale }: { locale: "en" | "zh-cn" }) => (
      <ul className="nav-list-grid">
        <NavMenuLink
          href="https://community.vatprc.net/c/69-category/12-category/12"
          large
          external
          className="row-span-4"
        >
          <Trans>Announcement</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/introduction">
          <Trans>Introduction</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/staff">
          <Trans>Staff</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/privacy">
          <Trans>Privacy Policy</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip" external>
          <Trans>Logo Pack</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/meeting">
          <Trans>Meeting Notes</Trans>
        </NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="https://community.vatprc.net" external>
          <Trans>Forum</Trans>
        </NavMenuLink>
        <NavMenuLink
          href={
            locale === "zh-cn" ? "https://community.vatprc.net/c/events/66-category/66" : "https://vatsim.net/events/"
          }
          external
        >
          <Trans>Event</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/api" external>
          <Trans>API Document</Trans>
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: <Trans>Operation</Trans>,
    content: () => (
      <ul className="nav-list-grid">
        <NavMenuLink href="/airspace/fir" large className="row-span-4">
          <Trans>Airspace</Trans>
        </NavMenuLink>
        <NavMenuLink href="/airspace/rvsm">
          <Trans>China RVSM</Trans>
        </NavMenuLink>
        <NavMenuLink href="/airspace/station">
          <Trans>ATC Positions & Frequencies</Trans>
        </NavMenuLink>
        <NavMenuLink href="/airspace/sop">
          <Trans>Standard Operation Procedures</Trans>
        </NavMenuLink>
        <NavMenuLink href="/airspace/vfr">
          <Trans>VFR Policy</Trans>
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: <Trans>Pilots</Trans>,
    content: () => (
      <ul className="nav-list-grid">
        <NavMenuLink href="/pilot/start-to-fly" large className="row-span-2">
          <Trans>Start to Fly</Trans>
        </NavMenuLink>
        <NavMenuLink href="/pilot/introduction-to-fly">
          <Trans>Introduction to Fly</Trans>
        </NavMenuLink>
        <NavMenuLink href="/pilot/ts3">
          <Trans>Community & Teamspeak 3</Trans>
        </NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="/pilot/pilot-softwares" large className="row-span-3">
          <Trans>Pilot Softwares</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://chartfox.org/">
          <Trans>Charts</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://vacdm.vatprc.net/">
          <Trans>vACDM</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://metar-taf.com/">
          <Trans>Weather</Trans>
        </NavMenuLink>
        <NavMenuLink href="/flights">
          <Trans>Flight plan checker</Trans>
          <Badge className="ml-2 rounded-full" variant="destructive">
            <Trans context="new feature">New</Trans>
          </Badge>
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: <Trans>Controllers</Trans>,
    content: () => (
      <ul className="nav-list-grid">
        <NavMenuLink href="/controller/controller-list" large className="row-span-3">
          <Trans>Controller List</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/controller-regulations">
          <Trans>Progression Guide</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/become-a-controller">
          <Trans>Become a Controller</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/visiting-and-transferring">
          <Trans>Visiting & Transfer</Trans>
        </NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="https://atc.vatprc.net" large external className="row-span-3">
          <Trans>ATC Center</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://moodle.vatprc.net" external>
          <Trans>Moodle</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/sector">
          <Trans>Sector Files</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/loa">
          <Trans>Letter of Agreement</Trans>
        </NavMenuLink>
      </ul>
    ),
  },
];

export const NavMenu: React.FC = () => {
  const locale = useLocale();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {contents.map((content, i) => (
          <NavigationMenuItem key={i}>
            <NavigationMenuTrigger>{content.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <content.content locale={locale} />
            </NavigationMenuContent>
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
  const { t } = useLingui();
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
            <img src={theme === "light" ? logo : logoWhite} alt={t`VATSIM P.R.China Division`} className="h-6" />
          </Link>
          <NavMenu />
          <div className="absolute top-2 right-8 ml-auto flex flex-row items-center gap-4 md:static md:top-auto md:right-auto">
            <ModeToggle />
            <LanguageToggle />
            <UserInfo />
          </div>
        </div>
      </header>
      <div className="pt-4">{children}</div>
      <footer className="mt-8 mb-4">
        <p className="text-slate-500 dark:text-slate-300">
          <Trans>
            &copy; 2010 - 2025, VATSIM P.R. China Division. All rights reserved. Powered by Microsoft Azure, .NET,
            TanStack and shadcn/ui. For simulation use only.
          </Trans>
        </p>
      </footer>
    </div>
  );
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  head: (ctx) => {
    const pathname = ctx.matches[ctx.matches.length - 1].pathname;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { title: ctx.match.context.i18n._("VATSIM P.R. China Division") },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "stylesheet", href: rehypeCssUrl },
        { rel: "alternate", hrefLang: "en", href: getLocalPathname(pathname, "en") },
        { rel: "alternate", hrefLang: "zh-cn", href: getLocalPathname(pathname, "zh-cn") },
      ],
    };
  },
});

function RootLayout() {
  const route = useRouterState();

  return (
    <html lang={useLocale() ?? "en"} className={cn(route.location.pathname !== "/division/api" && "scroll-pt-16")}>
      <head>
        <HeadContent />
      </head>
      <body className="px-1 md:px-0">
        <ThemeProvider defaultTheme="light" storageKey="vatprc-ui-theme">
          <Application>
            <Outlet />
          </Application>
        </ThemeProvider>
        <Toaster position="top-center" />
        <Scripts />
      </body>
    </html>
  );
}
