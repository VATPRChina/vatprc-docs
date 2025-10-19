import { lingui } from "@lingui/vite-plugin";
import netlify from "@netlify/vite-plugin-tanstack-start";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    !!process.env.NETLIFY && netlify(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    !process.env.VITEST && !process.env.NETLIFY && nitroV2Plugin({ preset: "node-server" }),
    viteReact({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui(),
    sentryVitePlugin({
      org: "xfoxfu",
      project: "vatprc-homepage",
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
        test: {
          include: ["**/*.unit.{test,spec}.ts"],
          name: "unit",
          environment: "node",
        },
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
      },
    ],
  },
});
