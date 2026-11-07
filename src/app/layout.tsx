import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";

import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "@fontsource-variable/martian-mono/wght.css";
import "./globals.css";

import { ServiceWorkerRegistration } from "@/shared/pwa/service-worker-registration";
import { QueryProvider } from "@/shared/ui/query-provider";

export const metadata: Metadata = {
  title: "Wallet Track",
  description: "Private monthly cash control.",
  applicationName: "Wallet Track",
  icons: {
    icon: [{ url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "Wallet Track", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // A CSP nonce only exists per request, so no page, the 404 included, may be prerendered.
  await connection();
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh antialiased">
        <QueryProvider>
          <ServiceWorkerRegistration />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
