import type { MantineColorScheme } from "@mantine/core";

const CYCLE: readonly MantineColorScheme[] = ["light", "dark", "auto"];

export const nextColorScheme = (current: MantineColorScheme): MantineColorScheme =>
  CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
