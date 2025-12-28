// @ts-check
import eslint from "@eslint/js";
import router from "@tanstack/eslint-plugin-router";
import pluginLingui from "eslint-plugin-lingui";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";

// import reactHooks from "eslint-plugin-react-hooks";

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
  // reactHooks.configs.flat.recommended,
  router.configs["flat/recommended"],
  { ignores: ["app/lib/api.d.ts"] },
  pluginLingui.configs["flat/recommended"],
);
