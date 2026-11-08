"use client";

import { cn } from "cn";

import { languageTag, LOCALES } from "./locale";
import { useI18n } from "./use-i18n";

// Two pressed-state buttons in a named group: a screen reader hears "Language" (or "Idioma"), each option's
// full name in its own language, and which one is pressed, that is, the language in use.
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, messages, setLocale } = useI18n();
  return (
    <div
      role="group"
      aria-label={messages.common.language}
      className={cn("inline-flex shrink-0 rounded-md border border-input p-0.5", className)}
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          lang={languageTag(option)}
          aria-pressed={option === locale}
          onClick={() => {
            if (option !== locale) {
              setLocale(option);
            }
          }}
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-[calc(var(--radius-md)-2px)] px-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:bg-primary aria-pressed:font-semibold aria-pressed:text-primary-foreground"
        >
          {option.toUpperCase()}
          <span className="sr-only"> ({messages.common.languageNames[option]})</span>
        </button>
      ))}
    </div>
  );
}
