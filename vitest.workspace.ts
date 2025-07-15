import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineWorkspace } from "vitest/config";

const plugins = [
  react(),
  tsConfigPaths({
    projects: ["./tsconfig.json"],
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
