// next/headers already keeps this out of client bundles; "server-only" is left out so page tests can import it.
import { cookies } from "next/headers";

import { LOCALE_COOKIE, parseLocale, type Locale } from "./locale";
import { MESSAGES, type Messages } from "./messages";

export async function getLocale(): Promise<Locale> {
  return parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

export async function getMessages(): Promise<Messages> {
  return MESSAGES[await getLocale()];
}
