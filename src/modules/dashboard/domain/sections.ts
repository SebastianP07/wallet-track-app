export interface DashboardSection {
  id: string;
  title: string;
  description: string;
  rows: 2 | 4 | 6;
}

// T4: everything the single Dashboard shows, in reading order.
export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { id: "kpis", title: "Overview", description: "Total actual, to pay, to arrive, left over, savings and the month's balance.", rows: 2 },
  { id: "charts", title: "Charts", description: "To pay by kind, and how the totals compare.", rows: 6 },
  { id: "accounts", title: "Accounts", description: "Where the money sits right now.", rows: 6 },
  { id: "fixed-expenses", title: "Fixed expenses", description: "Recurring bills with a due date.", rows: 6 },
  { id: "occasional-expenses", title: "Occasional expenses", description: "One-off payments this month.", rows: 4 },
  { id: "income", title: "Income", description: "What should arrive this month.", rows: 4 },
  { id: "card-charges", title: "Card charges", description: "Auto-charges to anticipate each statement.", rows: 4 },
  { id: "platforms", title: "Platforms", description: "Shared subscriptions and who owes what.", rows: 4 },
  { id: "savings", title: "Savings", description: "Savings accounts, kept apart from spendable money.", rows: 2 },
  { id: "overdue", title: "Overdue", description: "Items left unsettled by closed months.", rows: 2 },
  { id: "templates", title: "Recurring templates", description: "What opening a month copies into it. Changes apply to months opened from now on; months already opened keep their items.", rows: 4 },
  { id: "tags", title: "Tags", description: "Your own labels for expenses and templates. They never change a total.", rows: 2 },
];
