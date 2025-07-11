import { getPathname } from "./lib/utils";
import { routeTree } from "./routeTree.gen";
import "@/lib/i18n";
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
