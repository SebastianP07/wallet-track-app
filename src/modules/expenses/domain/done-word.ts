import type { PeriodItem } from "./types";
import type { DoneWord } from "@/shared/i18n/messages/expenses";

export function doneWordOf(kind: PeriodItem["kind"]): DoneWord {
  switch (kind) {
    case "income":
      return "received";
    case "card_charge":
      return "charged";
    default:
      return "paid";
  }
}
