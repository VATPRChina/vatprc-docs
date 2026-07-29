import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { clsx, type ClassValue } from "clsx";
import { ReactNode } from "react";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const getPathname = createIsomorphicFn()
  .server(() => getRequestUrl().pathname)
  .client(() => window.location.pathname);

type PromiseOrFunction = Promise<unknown> | (() => Promise<unknown>);

export const promiseWithLog = (promise: PromiseOrFunction, final?: () => unknown) => {
  (typeof promise === "function" ? promise() : promise).catch((err) => console.error(err)).finally(final);
};

export const wrapPromiseWithLog = (promise: PromiseOrFunction) => () => promiseWithLog(promise);

export const renderWithMap = <T extends string>(map: Map<T, React.FC>, value: T): ReactNode => {
  const Component = map.get(value);
  if (Component) return <Component />;
  return (
    <Alert>
      <Trans>Unknown: {value}</Trans>
    </Alert>
  );
};
