import type { DashboardKpis } from "./types";
import type { Messages } from "@/shared/i18n/messages";

export type KpiTone = "neutral" | "squared" | "mismatch";

export interface KpiTile {
  id: keyof DashboardKpis;
  label: string;
  hint: string;
  // Null when the month has no period to say it, or no opening balance to derive it from.
  value: number | null;
  tone: KpiTone;
}

export interface KpiGroup {
  title: string;
  tiles: KpiTile[];
}

// What a month with no period can still say: balances are current values (D6).
export type KnownKpis = Partial<DashboardKpis>;

// A mismatch asks to be seen; zero means the month squares with its opening balance.
export function mismatchTone(mismatch: number | null | undefined): KpiTone {
  if (mismatch === null || mismatch === undefined) {
    return "neutral";
  }
  return mismatch === 0 ? "squared" : "mismatch";
}

// Every number is the backend's (D1). Tags narrow lists, never these (D5).
export function kpiGroups(kpis: KnownKpis, messages: Messages): [standing: KpiGroup, month: KpiGroup] {
  const t = messages.dashboard.kpis;
  const tile = (
    id: keyof DashboardKpis,
    label: string,
    hint: string,
    value: number | null | undefined,
    tone: KpiTone = "neutral",
  ): KpiTile => ({ id, label, hint, value: value ?? null, tone });
  const mismatchHint =
    kpis.mismatch === null || kpis.mismatch === undefined
      ? t.mismatchUnknownHint
      : kpis.mismatch === 0
        ? t.mismatchSquaredHint
        : t.mismatchHint;
  return [
    {
      title: t.standing,
      tiles: [
        tile("currentTotal", t.currentTotal, t.currentTotalHint, kpis.currentTotal),
        tile("toPay", t.toPay, t.toPayHint, kpis.toPay),
        tile("toReceive", t.toReceive, t.toReceiveHint, kpis.toReceive),
        tile("surplus", t.surplus, t.surplusHint, kpis.surplus),
      ],
    },
    {
      title: t.month,
      tiles: [
        tile("openingBalance", t.openingBalance, t.openingBalanceHint, kpis.openingBalance),
        tile("incoming", t.incoming, t.incomingHint, kpis.incoming),
        tile("outgoing", t.outgoing, t.outgoingHint, kpis.outgoing),
        tile("balance", t.balance, t.balanceHint, kpis.balance),
        tile("expectedClose", t.expectedClose, t.expectedCloseHint, kpis.expectedClose),
        tile("mismatch", t.mismatch, mismatchHint, kpis.mismatch, mismatchTone(kpis.mismatch)),
      ],
    },
  ];
}
