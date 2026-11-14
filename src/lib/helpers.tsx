import { AlertDescription, Alert } from "@/components/ui/alert";
import { Trans } from "@lingui/react/macro";
import { ReactNode } from "react";

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
      <AlertDescription>
        <Trans>Unknown: {value}</Trans>
      </AlertDescription>
    </Alert>
  );
};
