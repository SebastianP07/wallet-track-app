import type { PeriodItem } from "@/modules/expenses/domain/types";
import { ItemRow } from "@/modules/expenses/ui/components/item-row";
import { monthLabel } from "@/modules/periods/domain/year-month";
import { formatDate } from "@/shared/format/date";
import { useI18n } from "@/shared/i18n/use-i18n";
import type { Tag } from "@/modules/tags/domain/types";

const DETAIL = "text-xs whitespace-nowrap text-muted-foreground";

interface OverdueRowProps {
  item: PeriodItem;
  tags: Tag[];
  onSettle: () => void;
}

// Editing and deleting stay in the item's own month, which the row names as where it comes from (D7).
export function OverdueRow({ item, tags, onSettle }: OverdueRowProps) {
  const { locale, messages } = useI18n();
  const t = messages.overdue;
  return (
    <ItemRow
      item={item}
      tags={tags}
      doneWord={item.kind === "income" ? "received" : "paid"}
      onSetDone={onSettle}
      details={
        <>
          <span className="text-xs font-medium whitespace-nowrap">
            {t.from(monthLabel(item.period, locale))}
          </span>
          <span className={DETAIL}>{t.kinds[item.kind]}</span>
          {item.dueDate ? <span className="text-xs whitespace-nowrap text-due">{messages.expenses.due(formatDate(item.dueDate))}</span> : null}
          {item.personId ? <span className={DETAIL}>{messages.income.sharedPlatforms}</span> : null}
        </>
      }
    />
  );
}
