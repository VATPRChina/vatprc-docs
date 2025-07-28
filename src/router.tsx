import { getLocale } from "./lib/i18n";
import { getPathname } from "./lib/utils";
import { routeTree } from "./routeTree.gen";
import { messages as en } from "@/locales/en.po";
import { messages as zh } from "@/locales/zh-cn.po";
import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import * as Sentry from "@sentry/react";
import { wrapCreateRootRouteWithSentry } from "@sentry/tanstackstart-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { serverOnly } from "@tanstack/react-start";
import { getRequestURL } from "@tanstack/react-start/server";

Sentry.init({
  dsn: "https://70174050ab722ce431b6906686263907@o131360.ingest.us.sentry.io/4509490348294144",
  sendDefaultPii: true,
});

const getRouterBasepath = (pathname: string) => {
  if (pathname.startsWith("/en")) {
    return "/en";
  }
  if (pathname.startsWith("/zh-cn")) {
    return "/zh-cn";
  }
  return "/";
};

const getServerPathname = serverOnly(() => getRequestURL().pathname);

export function createRouter() {
  const i18n = setupI18n();
  i18n.load("en", en);
  i18n.load("zh-cn", zh);

  const pathname = typeof window !== "undefined" ? window.location.pathname : getServerPathname();
  i18n.activate(getLocale(pathname));

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });

  const router = wrapCreateRootRouteWithSentry(
    createTanStackRouter({
      routeTree,
      scrollRestoration: true,
      defaultNotFoundComponent: () => <div>Not Found</div>,
      basepath: getRouterBasepath(getPathname()),
      context: {
        i18n,
        queryClient,
      },
      Wrap: ({ children }: { children: React.ReactNode }) => {
        return (
          <QueryClientProvider client={queryClient}>
            <I18nProvider i18n={i18n}>{children}</I18nProvider>
          </QueryClientProvider>
        );
      },
    }),
  );

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
