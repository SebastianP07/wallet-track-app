// T4: everything the single Dashboard shows, in reading order: the numbers, the money behind them, what
// the month owes and is owed, then the setup that rarely changes. Titles and descriptions live in the
// messages, under dashboard.sections.
export const DASHBOARD_SECTIONS = [
  "kpis",
  "charts",
  "accounts",
  "fixed-expenses",
  "occasional-expenses",
  "income",
  "overdue",
  "card-charges",
  "platforms",
  "templates",
  "tags",
  "security",
] as const;

export type DashboardSectionId = (typeof DASHBOARD_SECTIONS)[number];

export interface DashboardSection {
  id: DashboardSectionId;
  title: string;
  description: string;
}
