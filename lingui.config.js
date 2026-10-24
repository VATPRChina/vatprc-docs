// @ts-check
import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  sourceLocale: "en",
  locales: ["zh-cn", "en"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["src"],
      exclude: ["**/__screenshots__/**"],
    },
  ],
  format: formatter({
    origins: false,
    lineNumbers: false,
  }),
});
