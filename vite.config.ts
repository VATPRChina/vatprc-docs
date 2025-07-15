import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/i18n",
      strategy: ["url", "baseLocale"],
      urlPatterns: [
        {
          pattern: "/:path(.*)?",
          localized: [
            ["zh-cn", "/zh-cn/:path(.*)?"],
            ["en", "/en/:path(.*)?"],
          ],
        },
      ],
    }),
    sentryVitePlugin({
      org: "xfoxfu",
      project: "vatprc-homepage",
    }),
  ],
  build: { sourcemap: true },
  server: {
    proxy: {
      "/api/cors/vatsim-events-prc": { target: "https://my.vatsim.net/api/v2/events/latest", changeOrigin: true },
      "/uniapi": {
        target: "https://uniapi.vatprc.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uniapi/, ""),
      },
    },
  },
});
