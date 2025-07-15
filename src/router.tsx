import { getPathname } from "./lib/utils";
import { routeTree } from "./routeTree.gen";
import { getLocale } from "@/lib/i18n";
import { messages as en } from "@/locales/en.po";
import { messages as zh } from "@/locales/zh-cn.po";
import { i18n } from "@lingui/core";
import * as Sentry from "@sentry/react";
import { wrapCreateRootRouteWithSentry } from "@sentry/tanstackstart-react";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

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

export function createRouter() {
  const locale = getLocale();
  i18n.load("en", en);
  i18n.load("zh-cn", zh);
  i18n.activate(locale);

  const router = wrapCreateRootRouteWithSentry(
    createTanStackRouter({
      routeTree,
      scrollRestoration: true,
      defaultNotFoundComponent: () => <div>Not Found</div>,
      basepath: getRouterBasepath(getPathname()),
    }),
  );

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
