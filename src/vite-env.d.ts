/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEAD_WEBHOOK_URL?: string;
  readonly VITE_BOOKING_URL?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly VITE_META_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
