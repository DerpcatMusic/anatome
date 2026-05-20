/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_CLIENT_URL?: string;
  readonly PUBLIC_MUX_ENV_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
