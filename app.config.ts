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
      }),
    ],
  },
});
