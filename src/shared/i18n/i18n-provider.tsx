"use client";

import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { DEFAULT_LOCALE, languageTag, localeCookie, type Locale } from "./locale";
import { MESSAGES, type Messages } from "./messages";

export interface I18nValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}

// The default serves a component rendered with no provider around it, as in a unit test.
export const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  messages: MESSAGES[DEFAULT_LOCALE],
  setLocale: () => undefined,
});

interface I18nProviderProps {
  // What the server read from the cookie, so the first render and hydration agree.
  initialLocale: Locale;
  children: ReactNode;
}

export function I18nProvider({ initialLocale, children }: I18nProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = localeCookie(next, window.location.protocol === "https:");
      document.documentElement.lang = languageTag(next);
      setLocaleState(next);
      // Server-rendered text, the document title among it, follows on the next server render.
      router.refresh();
    },
    [router],
  );

  const value = useMemo(() => ({ locale, messages: MESSAGES[locale], setLocale }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
