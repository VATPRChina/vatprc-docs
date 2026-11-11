import { getDocumentCookie } from "./preferences";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie as getServerCookie } from "@tanstack/react-start/server";

export * from "./preferences";

export const getCookie = createIsomorphicFn()
  .client((key: string): string | null => getDocumentCookie(key))
  .server((key: string): string | null => getServerCookie(key) ?? null);
