export interface DashboardSection {
  id: string;
  title: string;
  description: string;
}

// T4: everything the single Dashboard shows, in reading order: the numbers, the money behind them, what
// the month owes and is owed, then the setup that rarely changes.
export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { id: "kpis", title: "Overview", description: "Total actual, to pay, to arrive, left over, savings and the month's balance. Card charges and other months' overdue items count toward none of them." },
  { id: "charts", title: "Charts", description: "To pay by kind, how the totals compare, and what is due next." },
  { id: "accounts", title: "Accounts", description: "Where the money sits right now." },
  { id: "savings", title: "Savings", description: "Savings accounts, kept apart from spendable money." },
  { id: "fixed-expenses", title: "Fixed expenses", description: "Recurring bills with a due date." },
  { id: "occasional-expenses", title: "Occasional expenses", description: "One-off payments this month." },
  { id: "income", title: "Income", description: "What should arrive this month." },
  { id: "overdue", title: "Overdue", description: "What closed months left unsettled, whichever month is selected. It counts toward no month's totals." },
  { id: "card-charges", title: "Card charges", description: "Auto-charges to anticipate each statement." },
  { id: "platforms", title: "Platforms", description: "Shared subscriptions and who owes what." },
  { id: "templates", title: "Recurring templates", description: "What opening a month copies into it. Changes apply to months opened from now on; months already opened keep their items." },
  { id: "tags", title: "Tags", description: "Your own labels for expenses, income and templates. They never change a total." },
  { id: "security", title: "Security", description: "Your passkeys and the devices signed in right now. Your authenticator app and recovery codes keep working alongside them." },
];
