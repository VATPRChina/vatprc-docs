import { getLocalPathname } from "@/lib/i18n";
import { LANGUAGE_COOKIE_KEY, setCookie } from "@/lib/settings";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon } from "@mantine/core";
import { TbLanguage } from "react-icons/tb";

export const LanguageToggle = () => {
  const { i18n, t } = useLingui();
  const nextLang = i18n.locale === "zh-cn" ? "en" : "zh-cn";

  const onClick = () => {
    setCookie(LANGUAGE_COOKIE_KEY, nextLang);
    window.location.assign(getLocalPathname(nextLang));
  };

  const ariaLabel = nextLang === "en" ? t`Switch to English` : t`Switch to Chinese`;

  return (
    <ActionIcon variant="subtle" color="gray" onClick={onClick} aria-label={ariaLabel}>
      <TbLanguage />
    </ActionIcon>
  );
};
