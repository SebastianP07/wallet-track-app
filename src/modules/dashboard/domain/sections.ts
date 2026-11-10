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

// The overview is the one section always open; every other one is an accordion that starts closed on each load.
export function isCollapsible(id: DashboardSectionId): boolean {
  return id !== "kpis";
}

// Sections too heavy to render while closed: they mount the first time they open and stay mounted after. The rest
// render while closed too, hidden, so their data loads as before and the closed header can summarize it.
export function mountsWhenOpened(id: DashboardSectionId): boolean {
  return id === "charts";
}
