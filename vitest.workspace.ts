import { paraglideVitePlugin } from "@inlang/paraglide-js";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineWorkspace } from "vitest/config";

const plugins = [
  react(),
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
];

export default defineWorkspace([
  {
    test: {
      include: ["**/*.unit.{test,spec}.ts"],
      name: "unit",
      environment: "node",
    },
    plugins,
  },
  {
    test: {
      include: ["**/*.browser.{test,spec}.{ts,tsx}"],
      name: "browser",
      browser: {
        provider: "playwright",
        enabled: true,
        headless: true,
        instances: [{ browser: "chromium" }],
      },
    },
    plugins,
  },
]);
