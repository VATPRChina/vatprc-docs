import { Button } from "./ui/button";
import { getLocalPathname } from "@/lib/i18n";
import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import { localStorage } from "@/lib/utils";
import { useRouterState } from "@tanstack/react-router";
import { TbLanguage } from "react-icons/tb";

export const LanguageToggle = () => {
  const state = useRouterState();
  const pathname = state.location.pathname;
  const nextLang = getLocale() === "zh-cn" ? "en" : "zh-cn";

  const onClick = () => {
    localStorage.setItem("vatprc-homepage-locale", nextLang);
    window.location.assign(getLocalPathname(pathname, nextLang));
  };

  const ariaLabel = nextLang === "en" ? m["layout_switch_english"]() : m["layout_switch_chinese"]();

  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label={ariaLabel}>
      <TbLanguage size={18} />
    </Button>
  );
};
