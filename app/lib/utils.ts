import { getRequestURL } from "@tanstack/react-start/server";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPathname = () => {
  if (typeof window !== "undefined" && typeof window.location !== "undefined") {
    return window.location.pathname;
  }
  return getRequestURL().pathname;
};
