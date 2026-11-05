import { DELETED_CARD_TITLE } from "./card-charge-copy";
import type { CardChargeTotal, CreditCard } from "./types";
import type { PeriodItem } from "@/modules/expenses/domain/types";

export interface CardGroup {
  // Null gathers the charges whose card was deleted.
  cardId: string | null;
  title: string;
  // From the backend (D1). Null while it has not caught up with a change, or could not be loaded.
  total: number | null;
  items: PeriodItem[];
}

interface GroupSources {
  items: PeriodItem[];
  totals: CardChargeTotal[];
  cards: CreditCard[];
  isFiltered: boolean;
}

// The backend orders the totals and always has a row for a card. A filter hides the cards it leaves
// empty, while their totals still cover the whole month (D5).
export function groupByCard({ items, totals, cards, isFiltered }: GroupSources): CardGroup[] {
  const itemsOf = (cardId: string | null) => items.filter((item) => item.cardId === cardId);
  const fromTotals = totals
    .filter(({ cardId }) => !isFiltered || itemsOf(cardId).length > 0)
    .map(
      ({ cardId, cardName, total }): CardGroup => ({
        cardId,
        title: cardName ?? DELETED_CARD_TITLE,
        total,
        items: itemsOf(cardId),
      }),
    );

  const known = new Set(totals.map(({ cardId }) => cardId));
  const notYetTotaled = [...new Set(items.map(({ cardId }) => cardId))]
    .filter((cardId) => !known.has(cardId))
    .map(
      (cardId): CardGroup => ({
        cardId,
        title: cards.find(({ id }) => id === cardId)?.name ?? DELETED_CARD_TITLE,
        total: null,
        items: itemsOf(cardId),
      }),
    );

  return [...fromTotals, ...notYetTotaled].toSorted(
    (a, b) => Number(a.cardId === null) - Number(b.cardId === null),
  );
}
