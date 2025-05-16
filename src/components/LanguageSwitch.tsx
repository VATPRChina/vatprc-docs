"use client";

import { Link, usePathname } from "@/lib/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

export const LanguageSwitch: React.FunctionComponent<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const locale = useLocale();
  const path = usePathname();
  const t = useTranslations("Layout");

  return (
    <Link
      href={path.replace(`/${locale}`, "")}
      locale={locale === "en" ? "zh-cn" : "en"}
      title={t("menu.lang")}
      className={className}
    >
      {children ?? <span>{t("menu.lang")}</span>}
    </Link>
  );
};
