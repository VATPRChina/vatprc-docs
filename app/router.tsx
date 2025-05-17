import { routeTree } from "./routeTree.gen";
import "@/lib/i18n";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: () => <div>Not Found</div>,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
