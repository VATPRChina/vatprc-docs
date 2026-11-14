import { AppFooter } from "@/components/app/app-footer";
import { AppHeader } from "@/components/app/app-header";
import { ThemeProvider } from "@/components/app/theme-provider";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
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

  if (route.location.pathname === "/division/api") {
    return children;
  }

  return (
    <>
      <div className={route.location.pathname === "/" ? "grid" : undefined}>
        <AppHeader overlayHero={route.location.pathname === "/"} />
        <div className={route.location.pathname === "/" ? "col-start-1 row-start-1 min-w-0" : "pt-4"}>{children}</div>
      </div>
      <AppFooter className="border-border border-t-2" />
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
    } catch {
      // Ignore storage access failures in restricted browser contexts.
    }
  });

  return (
    <html
      lang={i18n.locale}
      className={cn(publicHref !== "/division/api" && "scroll-pt-16", htmlColorScheme === "dark" && "dark")}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className="px-1 md:px-0">
        <ThemeProvider>
          <TooltipProvider>
            <Toaster>
              <Application>{children}</Application>
            </Toaster>
          </TooltipProvider>
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
          <Alert variant="destructive">
            <AlertTitle>
              <Trans>Error</Trans>
            </AlertTitle>
            <AlertDescription>
              <p className="font-medium">{error.message}</p>
              <p className="text-wrap">
                <pre>{error.stack}</pre>
              </p>
            </AlertDescription>
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
