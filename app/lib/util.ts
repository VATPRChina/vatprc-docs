import { getRequestURL } from "@tanstack/react-start/server";

export const getPathname = () => {
  if (typeof window !== "undefined" && typeof window.location !== "undefined") {
    return window.location.pathname;
  }
  return getRequestURL().pathname;
};
