import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";

import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "@fontsource-variable/martian-mono/wght.css";
import "./globals.css";

import { QueryProvider } from "@/shared/ui/query-provider";

export const metadata: Metadata = {
  title: "Wallet Track",
  description: "Private monthly cash control.",
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
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
