import {
  type ColorScheme,
  COLOR_SCHEME_COOKIE_KEY,
  getDocumentCookie,
  isColorScheme,
  setCookie,
} from "@/lib/preferences";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

export type { ColorScheme } from "@/lib/preferences";
const ThemeContext = createContext<{ colorScheme: ColorScheme; setColorScheme: (value: ColorScheme) => void }>({
  colorScheme: "auto",
  setColorScheme: () => undefined,
});

export function ThemeProvider({
  children,
  forceColorScheme,
  initialColorScheme,
}: PropsWithChildren<{ forceColorScheme?: ColorScheme; initialColorScheme?: ColorScheme }>) {
  const [colorScheme, setScheme] = useState<ColorScheme>(() => {
    const saved = getDocumentCookie(COLOR_SCHEME_COOKIE_KEY);
    return forceColorScheme ?? initialColorScheme ?? (isColorScheme(saved) ? saved : "auto");
  });
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const resolved = colorScheme === "auto" ? (media.matches ? "dark" : "light") : colorScheme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [colorScheme]);
  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        setColorScheme: (value) => {
          setCookie(COLOR_SCHEME_COOKIE_KEY, value);
          setScheme(value);
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export const useColorScheme = () => useContext(ThemeContext);
