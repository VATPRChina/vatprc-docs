import { serverOnly } from "@tanstack/react-start";
import { getRequestURL } from "@tanstack/react-start/server";

const getURLServer = serverOnly(() => {
  try {
    if (getRequestURL().pathname.startsWith("/en")) {
      return "en";
    }
  } catch {
    // ignore
  }
  return "zh-cn";
});

export const getLocale = () => {
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/en")) {
      return "en";
    }
    return "zh-cn";
  }
  const url = getURLServer();
  return url;
};

export const getLocalPathname = (pathname: string, locale: "en" | "zh-cn") => {
  let normalized = pathname;
  if (pathname.startsWith("/en")) {
    normalized = pathname.slice("/en".length);
  } else if (pathname.startsWith("/zh-cn")) {
    normalized = pathname.slice("/zh-cn".length);
  }
  return `/${locale}${normalized}`;
};
