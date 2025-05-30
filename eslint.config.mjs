// @ts-check
import eslint from "@eslint/js";
import router from "@tanstack/eslint-plugin-router";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  router.configs["flat/recommended"],
  { ignores: ["app/lib/api.d.ts"] },
);
