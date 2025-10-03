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
import { createRouter } from "@tanstack/react-router";

Sentry.init({
  dsn: "https://70174050ab722ce431b6906686263907@o131360.ingest.us.sentry.io/4509490348294144",
  sendDefaultPii: true,
});

const getRouterBasepath = (pathname: string) => {
  if (pathname.startsWith("/en")) {
    return "/en/";
  }
  if (pathname.startsWith("/zh-cn")) {
    return "/zh-cn/";
  }
  return "/";
};

export function getRouter() {
  const i18n = setupI18n();
  i18n.load("en", en);
  i18n.load("zh-cn", zh);

  i18n.activate(getLocale());

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
    createRouter({
      routeTree,
      scrollRestoration: true,
      defaultNotFoundComponent: () => <div>Not Found</div>,
      rewrite: {
        input: ({ url }) => {
          url.pathname = url.pathname.replace(getRouterBasepath(url.pathname), "/");
          return url;
        },
        output: ({ url }) => {
          url.pathname = url.pathname.replace("/", getRouterBasepath(getPathname()));
          return url;
        },
      },
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
