import { getPathname } from "./utils";

export const getLocale = (): "en" | "zh-cn" => {
  const pathname = getPathname();
  if (pathname.startsWith("/en")) {
    return "en";
  }
  if (pathname.startsWith("/zh-cn")) {
    return "zh-cn";
  }
  if (typeof navigator !== "undefined" && navigator.language.startsWith("zh")) {
    return "zh-cn";
  }
  if (typeof navigator !== "undefined" && navigator.language.startsWith("en")) {
    return "en";
  }
  return "zh-cn";
};

export const getLocalPathname = (locale: "en" | "zh-cn" | "", path?: string) => {
  const pathname = path ?? getPathname();
  let normalized = pathname;
  if (pathname.startsWith("/en")) {
    normalized = pathname.slice("/en".length);
  } else if (pathname.startsWith("/zh-cn")) {
    normalized = pathname.slice("/zh-cn".length);
  }
  if (locale === "") {
    return normalized;
  }
  return `/${locale}${normalized}`;
};
