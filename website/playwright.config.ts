import { defineConfig } from "playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./.vitest/e2e",
  use: { baseURL },
  webServer: {
    command: "pnpm exec vite dev --host 127.0.0.1 --port 4173 --strictPort",
    url: baseURL + "/en/events",
    env: { VITE_API_ENDPOINT: baseURL + "/uniapi" },
  },
});
