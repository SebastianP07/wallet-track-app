import type { DashboardKpis } from "./types";
import type { Messages } from "@/shared/i18n/messages";

export interface KpiTile {
  label: string;
  hint: string;
  // Null when the month has no period to say it.
  value: number | null;
}

export interface KpiGroup {
  title: string;
  tiles: KpiTile[];
}

// What a month with no period can still say: balances are current values (D6).
export type KnownKpis = Partial<DashboardKpis>;

// Every number is the backend's (D1). Tags narrow lists, never these (D5).
export function kpiGroups(kpis: KnownKpis, messages: Messages): [standing: KpiGroup, month: KpiGroup] {
  const t = messages.dashboard.kpis;
  const tile = (label: string, hint: string, value: number | undefined): KpiTile => ({
    label,
    hint,
    value: value ?? null,
  });
  return [
    {
      title: t.standing,
      tiles: [
        tile(t.currentTotal, t.currentTotalHint, kpis.currentTotal),
        tile(t.toPay, t.toPayHint, kpis.toPay),
        tile(t.toReceive, t.toReceiveHint, kpis.toReceive),
        tile(t.surplus, t.surplusHint, kpis.surplus),
      ],
    },
    {
      title: t.month,
      tiles: [
        tile(t.incoming, t.incomingHint, kpis.incoming),
        tile(t.outgoing, t.outgoingHint, kpis.outgoing),
        tile(t.balance, t.balanceHint, kpis.balance),
      ],
    },
  ];
}
