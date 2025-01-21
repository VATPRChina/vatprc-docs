import i18next from "i18next";
import en from "./locales/en.toml";
import zh from "./locales/zh-cn.toml";
import { getRelativeLocaleUrl } from "astro:i18n";
import type { GetStaticPathsOptions, GetStaticPathsResult } from "astro";

export const useTranslation = (locale?: string) =>
  i18next.init({
    lng: locale ?? "zh-cn",
    fallbackLng: "zh-cn",
    supportedLngs: ["zh-cn", "en"],
    lowerCaseLng: true,
    backend: {
      loadPath: "src/locales/{{lng}}/{{ns}}.yml",
    },
    defaultNS: "translation",
    resources: {
      en: { translation: en as any },
      "zh-cn": { translation: zh as any },
    },
  });

export const makePath = (path: string, locale?: string) =>
  getRelativeLocaleUrl(locale ?? "zh-cn", path);

export const getLocalePaths = (
  f?: (
    options: GetStaticPathsOptions
  ) => Promise<GetStaticPathsResult> | GetStaticPathsResult
): ((
  options: GetStaticPathsOptions
) => Promise<GetStaticPathsResult> | GetStaticPathsResult) => {
  return async (options) => {
    return ((await f?.(options)) ?? [{ params: {} }]).flatMap((p) => [
      { ...p, params: { ...p.params, locale: "zh-cn" } },
      { ...p, params: { ...p.params, locale: "en" } },
    ]);
  };
};
