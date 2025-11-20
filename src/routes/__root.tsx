import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import { LanguageToggle } from "@/components/language-toggle";
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
import { usePermissions } from "@/lib/client";
import { getLocale, getLocalPathname } from "@/lib/i18n";
import { MyRouterContext } from "@/lib/route-context";
import { cn } from "@/lib/utils";
import appCss from "@/styles/app.css?url";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import { Trans, useLingui } from "@lingui/react/macro";
import { ColorSchemeScript, createTheme, mantineHtmlProps, MantineProvider } from "@mantine/core";
import mantineCoreStyle from "@mantine/core/styles.css?url";
import mantineDateStyle from "@mantine/dates/styles.css?url";
import { NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useLocation,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { TbExternalLink } from "react-icons/tb";

const theme = createTheme({
  primaryColor: "vatprc",
  primaryShade: { light: 8, dark: 2 },
  colors: {
    vatprc: [
      "#ffebeb",
      "#fad5d5",
      "#f2a8a7",
      "#eb7877",
      "#e6504e",
      "#e33834",
      "#e22b26",
      "#c91e1a",
      "#ab1615",
      "#9d0b10",
    ],
  },
  fontFamily:
    '"Outfit", ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
});

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
        <NavMenuLink href="https://chartfox.org/" external>
          <Trans>Charts</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://vacdm.vatprc.net/" external>
          <Trans>vACDM</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://metar-taf.com/" external>
          <Trans>Weather</Trans>
        </NavMenuLink>
        <NavMenuLink href="/flights">
          <Trans>Flight plan checker</Trans>
          <Badge className="ml-2 bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100" variant="secondary">
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
  {
    title: <Trans>Admin</Trans>,
    requiresRole: "volunteer" as const,
    content: () => (
      <ul className="nav-list-grid">
        <NavMenuLink href="/events">
          <Trans>Event</Trans>
        </NavMenuLink>
        <NavMenuLink href="/users">
          <Trans>User List</Trans>
        </NavMenuLink>
        <NavMenuLink href="/docs/utils/image">
          <Trans>Image Upload Tool</Trans>
        </NavMenuLink>
      </ul>
    ),
  },
];

export const NavMenu: React.FC = () => {
  const locale = getLocale();
  const roles = usePermissions();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {contents.map((content, i) => {
          if (content.requiresRole && !roles.includes(content.requiresRole)) {
            return null;
          }
          return (
            <NavigationMenuItem key={i}>
              <NavigationMenuTrigger>{content.title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <content.content locale={locale} />
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

interface ApplicationProps {
  children?: React.ReactNode;
}

const Application: React.FC<ApplicationProps> = ({ children }: ApplicationProps) => {
  const { t } = useLingui();
  const route = useRouterState();
  if (route.location.pathname === "/division/api") {
    return children;
  }

  return (
    <>
      <header className="bg-background sticky top-0 z-50 w-full border-b-[1px] px-8 py-2">
        <div className="container mx-auto flex flex-col items-center gap-4 md:flex-row">
          <Link to="/">
            <img src={logo} alt={t`VATSIM P.R.China Division`} className="h-6 not-dark:block dark:hidden" />
            <img src={logoWhite} alt={t`VATSIM P.R.China Division`} className="h-6 not-dark:hidden dark:block" />
          </Link>
          <NavMenu />
          <div className="absolute top-2 right-8 ml-auto flex flex-row items-center gap-4 md:static md:top-auto md:right-auto">
            <ModeToggle />
            <LanguageToggle />
            <UserInfo />
          </div>
        </div>
      </header>
      {getLocale() === "zh-cn" && route.location.pathname === "/" && (
        <a
          className="block w-full bg-gray-100 py-4 text-center hover:bg-gray-50 dark:bg-gray-900 hover:dark:bg-gray-950"
          href="https://community.vatprc.net/t/topic/10193"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans>We need your help! Donate to VATPRC to help us to improve!</Trans>
        </a>
      )}
      <div className="pt-4">{children}</div>
      <footer className="container mx-auto mt-8 mb-4">
        <p className="text-slate-500 dark:text-slate-300">
          <Trans>
            &copy; 2010 - 2025, VATSIM P.R. China Division. All rights reserved. Powered by Microsoft Azure, .NET,
            TanStack and shadcn/ui. For simulation use only.
          </Trans>
        </p>
      </footer>
    </>
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
        { rel: "stylesheet", href: mantineCoreStyle },
        { rel: "stylesheet", href: mantineDateStyle },

        { rel: "alternate", hrefLang: "en", href: getLocalPathname("en", pathname) },
        { rel: "alternate", hrefLang: "zh-cn", href: getLocalPathname("zh-cn", pathname) },
        { rel: "alternate", hrefLang: "x-default", href: getLocalPathname("", pathname) },

        { rel: "preconnect", href: "https://fonts.loli.net" },
        { rel: "preconnect", href: "https://gstatic.loli.net", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.loli.net/css2?family=Outfit:wght@100..900&display=swap",
        },
      ],
    };
  },
});

function RootLayout() {
  const { publicHref } = useLocation();

  useEffect(() => {
    if (publicHref.startsWith("/en") || publicHref.startsWith("/zh-cn")) {
      return;
    }

    if (publicHref.includes("/auth/callback")) {
      return;
    }

    const locale = localStorage.getItem("vatprc-homepage-locale") as "en" | "zh-cn" | null;
    if (locale) {
      setTimeout(() => window.location.replace(getLocalPathname(locale)));
    }
  });

  return (
    <html
      lang={getLocale() ?? "en"}
      className={cn(publicHref !== "/division/api" && "scroll-pt-16")}
      {...mantineHtmlProps}
    >
      <head>
        <HeadContent />
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className="px-1 md:px-0">
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Application>
            <Outlet />
          </Application>
        </MantineProvider>
        <Toaster position="top-center" />
        <Scripts />
      </body>
    </html>
  );
}
