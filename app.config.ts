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
    devProxy: {
      "/api/cors/online-status": { target: "https://uniapi.vatprc.net/api/compat/online-status", changeOrigin: true },
      "/api/cors/vatsim-events-prc": { target: "https://my.vatsim.net/api/v2/events/latest", changeOrigin: true },
      "/uniapi": { target: "https://uniapi.vatprc.net", changeOrigin: true },
    },
  },
});
