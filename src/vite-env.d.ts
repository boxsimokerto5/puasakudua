/// <reference types="vite/client" />

declare const __APP_BUILD_TIME__: number;

interface ImportMetaEnv {
  readonly VITE_IMGBB_API_KEY?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

