"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export const LanguageSwitch: React.FunctionComponent<{
  locale: string;
}> = ({ locale }) => {
  const path = usePathname();
  const t = useTranslations("Layout");
  return (
    <Link
      href={path.replace(`/${locale}`, "")}
      locale={locale === "en" ? "zh-cn" : "en"}
    >
      <span>{t("menu.lang")}</span>
    </Link>
  );
};
