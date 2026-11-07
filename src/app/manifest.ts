import type { MetadataRoute } from "next";

const BLACK = "#0a0a0a";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Wallet Track",
    short_name: "Wallet Track",
    description: "Private monthly cash control.",
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
