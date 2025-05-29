import { getPathname } from "./lib/utils";
import { routeTree } from "./routeTree.gen";
import "@/lib/i18n";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

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
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: () => <div>Not Found</div>,
    basepath: getRouterBasepath(getPathname()),
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
