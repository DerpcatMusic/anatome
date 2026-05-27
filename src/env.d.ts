/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_CLIENT_URL?: string;
  readonly PUBLIC_MUX_ENV_KEY?: string;
  readonly PUBLIC_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
