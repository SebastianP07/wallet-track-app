export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

// The owner reads Spanish first; English is the other choice, never guessed from the browser.
export const DEFAULT_LOCALE: Locale = "es";

// Read by the server for the first render, by the client to switch, and by public/offline.js, which names it too.
export const LOCALE_COOKIE = "locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export function parseLocale(value: unknown): Locale {
  return LOCALES.find((locale) => locale === value) ?? DEFAULT_LOCALE;
}

// `<html lang>` and every Intl formatter. Money keeps its own Colombian format in both languages.
const LANGUAGE_TAGS: Record<Locale, string> = { es: "es-CO", en: "en-US" };

export function languageTag(locale: Locale): string {
  return LANGUAGE_TAGS[locale];
}

export function localeCookie(locale: Locale, secure: boolean): string {
  return [
    `${LOCALE_COOKIE}=${locale}`,
    "Path=/",
    `Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}
