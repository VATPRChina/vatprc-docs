import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Trans } from "@lingui/react/macro";
import { useMantineColorScheme } from "@mantine/core";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { colorScheme, setColorScheme, toggleColorScheme, clearColorScheme } = useMantineColorScheme();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => toggleColorScheme()}>
          {colorScheme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {colorScheme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">
            <Trans>Toggle theme</Trans>
          </span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-auto px-0 py-1" asChild>
        <ul className="flex cursor-default flex-col">
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => setColorScheme("light")}>
              <Trans>Light</Trans>
            </li>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => setColorScheme("dark")}>
              <Trans>Dark</Trans>
            </li>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => clearColorScheme()}>
              <Trans>System</Trans>
            </li>
          </Button>
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
