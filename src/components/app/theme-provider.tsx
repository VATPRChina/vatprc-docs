import { COLOR_SCHEME_COOKIE_KEY, getCookie, isColorScheme, setCookie, type ColorScheme } from "@/lib/settings";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ThemeContext = createContext<{ colorScheme: ColorScheme; setColorScheme: (value: ColorScheme) => void }>({
  colorScheme: "auto",
  setColorScheme: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setScheme] = useState<ColorScheme>(() => {
    const saved = getCookie(COLOR_SCHEME_COOKIE_KEY);
    return isColorScheme(saved) ? saved : "auto";
  });
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () =>
      document.documentElement.classList.toggle(
        "dark",
        colorScheme === "dark" || (colorScheme === "auto" && media.matches),
      );
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
