/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_CLIENT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
