import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE, languageTag } from "@/shared/i18n/locale";
import { MESSAGES } from "@/shared/i18n/messages";

const BLACK = "#0a0a0a";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Wallet Track",
    short_name: "Wallet Track",
    // A browser fetches the manifest without cookies, so it cannot follow the chosen language: it is in the default one.
    description: MESSAGES[DEFAULT_LOCALE].common.appDescription,
    lang: languageTag(DEFAULT_LOCALE),
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BLACK,
    theme_color: BLACK,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
