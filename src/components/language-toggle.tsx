import { getLocale, getLocalPathname } from "@/lib/i18n";
import { localStorage } from "@/lib/utils";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon } from "@mantine/core";
import { TbLanguage } from "react-icons/tb";

export const LanguageToggle = () => {
  const nextLang = getLocale() === "zh-cn" ? "en" : "zh-cn";

  const { t } = useLingui();

  const onClick = () => {
    localStorage.setItem("vatprc-homepage-locale", nextLang);
    window.location.assign(getLocalPathname(nextLang));
  };

  const ariaLabel = nextLang === "en" ? t`Switch to English` : t`Switch to Chinese`;

  return (
    <ActionIcon variant="subtle" color="gray" onClick={onClick} aria-label={ariaLabel}>
      <TbLanguage />
    </ActionIcon>
  );
};
