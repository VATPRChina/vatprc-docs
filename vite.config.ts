import { lingui } from "@lingui/vite-plugin";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/// <reference types="vitest/config" />

export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    !process.env.VITEST && tanstackStart(),
    !process.env.VITEST && nitroV2Plugin({ preset: "node-server" }),
    viteReact({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui(),
    sentryVitePlugin({
      org: "xfoxfu",
      project: "vatprc-homepage",
      telemetry: false,
    }),
  ],
  build: { sourcemap: true },
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
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          include: ["**/*.unit.{test,spec}.ts"],
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
});
