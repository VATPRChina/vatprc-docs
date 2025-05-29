import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./app/lib/i18n",
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
    ],
  },
  server: {
    routeRules: {
      "/api/cors/online-status": { proxy: { to: "https://uniapi.vatprc.net/api/compat/online-status" } },
      "/api/cors/vatsim-events-prc": { proxy: { to: "https://my.vatsim.net/api/v2/events/latest" } },
    },
  },
});
