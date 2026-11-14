import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

export const getPathname = createIsomorphicFn()
  .server(() => getRequestUrl().pathname)
  .client(() => window.location.pathname);
