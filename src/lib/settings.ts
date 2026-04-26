import { type MantineColorScheme, type MantineColorSchemeManager } from "@mantine/core";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie as getServerCookie } from "@tanstack/react-start/server";

export const LANGUAGE_COOKIE_KEY = "vatprc-homepage-locale";
export const COLOR_SCHEME_COOKIE_KEY = "vatprc-color-scheme";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const noop = () => undefined;

export const isLocale = (value: string | null): value is "en" | "zh-cn" => value === "en" || value === "zh-cn";

const getDocumentCookie = (key: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${encodeURIComponent(key)}=`))
    ?.split("=")[1];

  return cookie ? decodeURIComponent(cookie) : null;
};

export const getCookie = createIsomorphicFn()
  .client((key: string): string | null => getDocumentCookie(key))
  .server((key: string): string | null => getServerCookie(key) ?? null);

export const setCookie = (key: string, value: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
    value,
  )}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const clearCookie = (key: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(key)}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const isColorScheme = (value: string | null): value is MantineColorScheme =>
  value === "light" || value === "dark" || value === "auto";

export const cookieColorSchemeManager = ({ key = COLOR_SCHEME_COOKIE_KEY } = {}): MantineColorSchemeManager => ({
  get: (defaultValue) => {
    const value = getCookie(key);
    return isColorScheme(value) ? value : defaultValue;
  },
  set: (value) => {
    setCookie(key, value);
  },
  subscribe: noop,
  unsubscribe: noop,
  clear: () => {
    clearCookie(key);
  },
});
