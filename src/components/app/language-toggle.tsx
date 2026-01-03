import { wrapPromiseWithLog } from "@/lib/utils";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon } from "@mantine/core";
import { TbLanguage } from "react-icons/tb";

export const LANGUAGE_STORAGE_KEY = "vatprc-homepage-locale";

export const LanguageToggle = () => {
  const { i18n, t } = useLingui();
  const nextLang = i18n.locale === "zh-cn" ? "en" : "zh-cn";

  const onClick = wrapPromiseWithLog(async () => {
    await cookieStore.set(LANGUAGE_STORAGE_KEY, nextLang);
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    i18n.activate(nextLang);
  });

  const ariaLabel = nextLang === "en" ? t`Switch to English` : t`Switch to Chinese`;

  return (
    <ActionIcon variant="subtle" color="gray" onClick={onClick} aria-label={ariaLabel}>
      <TbLanguage />
    </ActionIcon>
  );
};
