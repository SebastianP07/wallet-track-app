import { doneWordOf } from "@/modules/expenses/domain/done-word";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

interface SettleConfirmDialogProps {
  item: PeriodItem | null;
  onConfirm: (item: PeriodItem) => Promise<unknown>;
  onClose: () => void;
}

// Owned by the section, not the row: a settled item leaves the list at once, while the question waits for the server.
export function SettleConfirmDialog({ item, onConfirm, onClose }: SettleConfirmDialogProps) {
  const t = useMessages().feedback.confirm.markDone;
  const word = item ? doneWordOf(item.kind) : "paid";
  return (
    <ConfirmDialog
      open={item !== null}
      title={item ? t.title(item.name, word) : ""}
      description={t.text}
      confirmLabel={t.action(word)}
      onConfirm={() => (item ? onConfirm(item) : undefined)}
      onClose={onClose}
    />
  );
}
