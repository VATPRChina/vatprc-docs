import { notifications } from "@mantine/notifications";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPathname = createIsomorphicFn()
  .server(() => getRequestUrl().pathname)
  .client(() => window.location.pathname);

export const localStorage = (typeof window !== "undefined" ? window.localStorage : null) ?? {
  getItem: () => null,
  setItem: () => null,
};

export const errorToast = (err: Error) => {
  notifications.show({
    title: "An error occurred.",
    message: err.message,
    color: "red",
  });
};

type PromiseOrFunction = Promise<unknown> | (() => Promise<unknown>);

export const promiseWithLog = (promise: PromiseOrFunction, final?: () => unknown) => {
  (typeof promise === "function" ? promise() : promise).catch((err) => console.error(err)).finally(final);
};

export const promiseWithToast = (promise: PromiseOrFunction, final?: () => unknown) => {
  (typeof promise === "function" ? promise() : promise)
    .catch((err) => {
      console.error(err);
      notifications.show({
        title: "An error occurred.",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: err.message ?? err?.error?.message ?? (err as Error).message ?? "Unknown error",
        color: "red",
      });
    })
    .finally(final);
};

export const wrapPromiseWithToast = (promise: PromiseOrFunction) => () => promiseWithToast(promise);
