import { useTheme, useThemeValue } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Trans } from "@lingui/react/macro";
import { TbMoon, TbSun } from "react-icons/tb";

export function ModeToggle() {
  const theme = useThemeValue();
  const { setTheme } = useTheme();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}>
          <TbSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <TbMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">
            <Trans>Toggle theme</Trans>
          </span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-auto px-0 py-1" asChild>
        <ul className="flex cursor-default flex-col">
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => setTheme("light")}>
              <Trans>Light</Trans>
            </li>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => setTheme("dark")}>
              <Trans>Dark</Trans>
            </li>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => setTheme("system")}>
              <Trans>System</Trans>
            </li>
          </Button>
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
