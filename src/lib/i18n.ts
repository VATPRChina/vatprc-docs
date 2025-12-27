import { getPathname } from "./utils";
import { I18n, MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

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

export const localizeWithMap = <T extends string>(
  map: Map<T, MessageDescriptor>,
  value: T | undefined,
  i18n: I18n,
): string => {
  if (!value) return "-";

  const message = map.get(value);
  if (message) return i18n._(message);
  return i18n._(msg`Unknown: ${value}`);
};
