import { overwriteGetLocale } from "./i18n/runtime";
import { getRequestURL } from "@tanstack/react-start/server";

overwriteGetLocale(() => {
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/en")) {
      return "en";
    }
    return "zh-cn";
  }
  if (getRequestURL().pathname.startsWith("/en")) {
    return "en";
  } else {
    return "zh-cn";
  }
  return "zh-cn";
});
