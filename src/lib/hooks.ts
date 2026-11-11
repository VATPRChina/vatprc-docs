import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useDisclosure(initial = false) {
  const [opened, setOpened] = useState(initial);
  const handlers = useMemo(
    () => ({
      open: () => setOpened(true),
      close: () => setOpened(false),
      toggle: () => setOpened((value) => !value),
    }),
    [],
  );
  return [opened, handlers] as const;
}

export function useDebouncedCallback<T extends unknown[]>(callback: (...args: T) => void, delay: number) {
  const latest = useRef(callback);
  latest.current = callback;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return useCallback(
    (...args: T) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay],
  );
}

export function useInterval(callback: () => void, delay: number) {
  const latest = useRef(callback);
  latest.current = callback;
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => latest.current(), delay);
    return () => clearInterval(timer);
  }, [active, delay]);
  return { start: useCallback(() => setActive(true), []), stop: useCallback(() => setActive(false), []), active };
}
