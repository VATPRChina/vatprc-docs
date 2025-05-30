import { Button } from "./ui/button";
import { getLocale } from "@/lib/i18n/runtime";
import { getPathname } from "@/lib/utils";
import { TbLanguage } from "react-icons/tb";

export const LanguageToggle = () => {
  const pathnameAnotherLang =
    getLocale() === "zh-cn" ? getPathname().replace("/zh-cn", "/en") : getPathname().replace("/en", "/zh-cn");

  return (
    <Button variant="ghost" size="icon" asChild>
      <a href={pathnameAnotherLang} className="cursor-default">
        <TbLanguage size={18} />
      </a>
    </Button>
  );
};
