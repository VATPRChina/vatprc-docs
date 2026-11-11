import { AppFooter } from "@/components/app/app-footer";
import { AppHeader } from "@/components/app/app-header";
import { Alert, ThemeProvider } from "@/components/ui";
import { Notifications } from "@/components/ui/notifications";
import { useNewNavigationFlag } from "@/lib/experimental-features";
import { getLocalPathname } from "@/lib/i18n";
import { MyRouterContext } from "@/lib/route-context";
import { COLOR_SCHEME_COOKIE_KEY, getCookie, isColorScheme } from "@/lib/settings";
import { cn } from "@/lib/utils";
import appCss from "@/styles/app.css?url";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
  useRouterState,
} from "@tanstack/react-router";
import mapLibreCss from "maplibre-gl/dist/maplibre-gl.css?url";
import { FC, PropsWithChildren, useEffect } from "react";

interface ApplicationProps {
  children?: React.ReactNode;
}

const Application: React.FC<ApplicationProps> = ({ children }: ApplicationProps) => {
  const route = useRouterState();
  const useNewNav = useNewNavigationFlag();
  const isHomepage = route.location.pathname === "/" && !useNewNav;

  if (route.location.pathname === "/division/api") {
    return children;
  }

  return (
    <>
      <div className={isHomepage ? "grid" : undefined}>
        <AppHeader overlayHero={isHomepage} />
        <div className={isHomepage ? "col-start-1 row-start-1 min-w-0" : ""}>{children}</div>
      </div>
      <AppFooter />
    </>
  );
};

const AppHtml: FC<PropsWithChildren> = ({ children }) => {
  const { publicHref } = useLocation();
  const { i18n } = useLingui();
  const colorScheme = getCookie(COLOR_SCHEME_COOKIE_KEY);
  const htmlColorScheme = isColorScheme(colorScheme) && colorScheme !== "auto" ? colorScheme : "light";

  useEffect(() => {
    try {
      window.localStorage.removeItem("vatprc-homepage-locale");
      window.localStorage.removeItem("mantine-color-scheme-value");
    } catch {
      // Ignore storage access failures in restricted browser contexts.
    }
  });

  return (
    <html
      lang={i18n.locale}
      className={cn(publicHref !== "/division/api" && "scroll-pt-16")}
      data-theme={htmlColorScheme}
    >
      <head>
        <HeadContent />
      </head>
      <body className="px-1 md:px-0">
        <ThemeProvider initialColorScheme={isColorScheme(colorScheme) ? colorScheme : "auto"}>
          <Application>{children}</Application>
          <Notifications />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  errorComponent: ({ error }) => {
    useEffect(() => {
      void import("@sentry/tanstackstart-react").then(({ captureException }) => captureException(error));
    }, [error]);

    return (
      <AppHtml>
        <div className="container mx-auto">
          <Alert color="red" title={<Trans>Error</Trans>}>
            <p className="font-medium">{error.message}</p>
            <p className="text-wrap">
              <pre>{error.stack}</pre>
            </p>
          </Alert>
        </div>
      </AppHtml>
    );
  },
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
        { rel: "stylesheet", href: mapLibreCss },

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
  return (
    <AppHtml>
      <Outlet />
    </AppHtml>
  );
}
