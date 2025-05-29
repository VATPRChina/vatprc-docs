import { useTheme, useThemeValue } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { m } from "@/lib/i18n/messages";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const theme = useThemeValue();
  const { setTheme } = useTheme();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-auto px-0 py-1" asChild>
        <ul className="flex flex-col cursor-default">
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => setTheme("light")}>{m["theme_toggle_light"]()}</li>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => setTheme("dark")}>{m["theme_toggle_dark"]()}</li>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-none px-4">
            <li onClick={() => setTheme("system")}>{m["theme_toggle_system"]()}</li>
          </Button>
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
