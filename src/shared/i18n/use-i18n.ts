import { useContext } from "react";

import { I18nContext, type I18nValue } from "./i18n-provider";
import type { Messages } from "./messages";

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

export function useMessages(): Messages {
  return useContext(I18nContext).messages;
}

// Text kept in state across a language switch: it is worded again with whatever language is current.
export type Translatable = (messages: Messages) => string;
