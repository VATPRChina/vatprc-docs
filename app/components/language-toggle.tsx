import { Button } from "./ui/button";
import { getLocale } from "@/lib/i18n/runtime";
import { getPathname } from "@/lib/utils";
import { localStorage } from "@/lib/utils";
import { useRouterState } from "@tanstack/react-router";
import { TbLanguage } from "react-icons/tb";

export const LanguageToggle = () => {
  const state = useRouterState();
  const pathname = state.location.pathname ?? getPathname();
  const pathnameAnotherLang =
    getLocale() === "zh-cn" ? pathname.replace("/zh-cn", "/en") : pathname.replace("/en", "/zh-cn");

  const onClick = () => {
    localStorage.setItem("vatprc-homepage-locale", getLocale() === "zh-cn" ? "en" : "zh-cn");
    window.location.assign(pathnameAnotherLang);
  };

  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <a href={pathnameAnotherLang} className="cursor-default">
        <TbLanguage size={18} />
      </a>
    </Button>
  );
};
