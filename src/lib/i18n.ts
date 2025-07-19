import { useRouterState } from "@tanstack/react-router";

export const getLocale = (pathname: string): "en" | "zh-cn" => {
  if (pathname.startsWith("/en")) {
    return "en";
  }
  if (pathname.startsWith("/zh-cn")) {
    return "zh-cn";
  }
  return "zh-cn";
};

export const useLocale = (): "en" | "zh-cn" => {
  const path = useRouterState().location.pathname;
  return getLocale(path);
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
