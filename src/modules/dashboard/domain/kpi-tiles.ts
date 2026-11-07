import type { DashboardKpis } from "./types";

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

// What a month with no period can still say: balances are current values (D6, D9).
export type KnownKpis = Partial<DashboardKpis>;

const TODAY = "Today's balances, in any month";

// Every number is the backend's (D1). Tags narrow lists, never these (D5).
export function kpiGroups(kpis: KnownKpis): [standing: KpiGroup, month: KpiGroup] {
  const tile = (label: string, hint: string, value: number | undefined): KpiTile => ({
    label,
    hint,
    value: value ?? null,
  });
  return [
    {
      title: "Where you stand",
      tiles: [
        tile("Total actual", TODAY, kpis.currentTotal),
        tile("To pay", "Pending fixed and occasional, plus overdue", kpis.toPay),
        tile("To arrive", "Pending income", kpis.toReceive),
        tile("Left over", "Total actual − to pay + to arrive", kpis.surplus),
        tile("Savings", TODAY, kpis.savings),
      ],
    },
    {
      title: "The month's balance",
      tiles: [
        tile("Coming in", "All income, paid or not", kpis.incoming),
        tile("Going out", "All fixed, occasional and overdue, paid or not", kpis.outgoing),
        tile("Balance", "Coming in − going out", kpis.balance),
      ],
    },
  ];
}
