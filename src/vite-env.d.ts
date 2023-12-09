/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly NEVER: false
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __VERSION__: string
declare const __COMMIT_HASH__: string
declare const __COMMIT_DATE__: string
