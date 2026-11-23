/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_B3_API_BASE_URL?: string;
  /** Compatibilidad con despliegues antiguos; usar VITE_B3_API_BASE_URL. */
  readonly VITE_B3_MOBILE_CONFIG_URL?: string;
  readonly VITE_B3_PUBLIC_CATALOG_URL?: string;
  readonly VITE_B3_ENABLE_DESIGN_PREVIEW?: string;
  readonly VITE_TUVERSO_WEB_EMBED_URL?: string;
}
