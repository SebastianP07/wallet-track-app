import type { Locale } from "../locale";
import { accounts } from "./accounts";
import { auth } from "./auth";
import { cards } from "./cards";
import { common } from "./common";
import { dashboard } from "./dashboard";
import { expenses } from "./expenses";
import { feedback } from "./feedback";
import { income } from "./income";
import { overdue } from "./overdue";
import { periods } from "./periods";
import { platforms } from "./platforms";
import { security } from "./security";
import { tags } from "./tags";
import { validation } from "./validation";

// One file per area, each holding both languages: the Spanish object is typed by the English one, so a key
// missing from either fails the typecheck.
const NAMESPACES = {
  common,
  feedback,
  validation,
  dashboard,
  accounts,
  periods,
  expenses,
  income,
  cards,
  overdue,
  platforms,
  tags,
  auth,
  security,
};

type Namespaces = typeof NAMESPACES;

export type Messages = { [Name in keyof Namespaces]: Namespaces[Name]["en"] };

function messagesIn(locale: Locale): Messages {
  return Object.fromEntries(
    Object.entries(NAMESPACES).map(([name, namespace]) => [name, namespace[locale]]),
  ) as Messages;
}

export const MESSAGES: Record<Locale, Messages> = { en: messagesIn("en"), es: messagesIn("es") };
