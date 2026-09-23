/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_URL: string;
  readonly VITE_HELIUS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Optional Node process in scripts / SSR */
declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};

/** Optional helius-sdk module (may be absent until npm install) */
declare module "helius-sdk" {
  export function createHelius(opts: {
    apiKey: string;
    network?: string;
  }): unknown;
}
