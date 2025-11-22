import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { getLocale, getLocalPathname } from "@/lib/i18n";
import { MyRouterContext } from "@/lib/route-context";
import { cn } from "@/lib/utils";
import appCss from "@/styles/app.css?url";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import { Trans } from "@lingui/react/macro";
import { ColorSchemeScript, createTheme, mantineHtmlProps, MantineProvider } from "@mantine/core";
import mantineCoreStyle from "@mantine/core/styles.css?url";
import mantineDateStyle from "@mantine/dates/styles.css?url";
import mantineDropzoneStyle from "@mantine/dropzone/styles.css?url";
import { Notifications } from "@mantine/notifications";
import mantineNotificationStyle from "@mantine/notifications/styles.css?url";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";

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
  defaultRadius: 0,
});

interface ApplicationProps {
  children?: React.ReactNode;
}

const Application: React.FC<ApplicationProps> = ({ children }: ApplicationProps) => {
  const route = useRouterState();
  if (route.location.pathname === "/division/api") {
    return children;
  }

  return (
    <>
      <AppHeader />
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
      <AppFooter />
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
        { rel: "stylesheet", href: mantineDropzoneStyle },
        { rel: "stylesheet", href: mantineNotificationStyle },

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
          <Notifications position="top-center" />
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
