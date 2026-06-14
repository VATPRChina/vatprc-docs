import { lingui, linguiTransformerBabelPreset } from "@lingui/vite-plugin";
import babel from "@rolldown/plugin-babel";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { nitro } from "nitro/vite";
import { defineConfig } from "vitest/config";

/// <reference types="vitest/config" />

export default defineConfig(({ command }) => ({
  plugins: [
    !process.env.VITEST && tanstackStart(),
    // nitro is a list of plugins so gating with command
    !process.env.VITEST && command !== "serve" && nitro(),
    tailwindcss(),
    viteReact(),
    lingui(),
    babel({
      presets: [linguiTransformerBabelPreset()],
    }),
    sentryVitePlugin({
      org: "xfoxfu",
      project: "vatprc-homepage",
      telemetry: false,
    }),
  ],
  build: { sourcemap: true },
  resolve: { tsconfigPaths: true },
  server: {
    proxy: {
      "/uniapi": {
        target: "https://uniapi.vatprc.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uniapi/, ""),
      },
      "/community": {
        target: "https://community.vatprc.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/community/, ""),
      },
      "/hi": "https://example.com",
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          include: ["**/*.unit.{test,spec}.{ts,tsx}"],
          name: "unit",
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          include: ["**/*.browser.{test,spec}.{ts,tsx}"],
          name: "browser",
          browser: {
            provider: playwright(),
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
}));
