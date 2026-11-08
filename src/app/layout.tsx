import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";

import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "@fontsource-variable/martian-mono/wght.css";
import "./globals.css";

import { I18nProvider } from "@/shared/i18n/i18n-provider";
import { languageTag } from "@/shared/i18n/locale";
import { getLocale, getMessages } from "@/shared/i18n/server-locale";
import { ServiceWorkerRegistration } from "@/shared/pwa/service-worker-registration";
import { QueryProvider } from "@/shared/ui/query-provider";

export async function generateMetadata(): Promise<Metadata> {
  const { common } = await getMessages();
  return {
    title: common.appName,
    description: common.appDescription,
    applicationName: common.appName,
    icons: {
      icon: [{ url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" }],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    appleWebApp: { capable: true, title: common.appName, statusBarStyle: "black" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // A CSP nonce only exists per request, so no page, the 404 included, may be prerendered.
  await connection();
  // The cookie decides the first render, so the page never arrives in one language and switches to the other.
  const locale = await getLocale();
  return (
    <html lang={languageTag(locale)} className="dark">
      <body className="min-h-dvh antialiased">
        <I18nProvider initialLocale={locale}>
          <QueryProvider>
            <ServiceWorkerRegistration />
            {children}
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
