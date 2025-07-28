/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_API_AUTH_ENDPOINT: string;
  readonly VITE_API_REDIRECT_URI: string;
  readonly VITE_API_CLIENT_ID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.po" {
  export const messages: import("@lingui/core").Messages;
}
