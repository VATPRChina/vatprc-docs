// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import { ViteToml } from "vite-plugin-toml";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind(), vue()],
  i18n: {
    locales: ["en", "zh-cn"],
    defaultLocale: "zh-cn",
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: { plugins: [ViteToml()] },
});
