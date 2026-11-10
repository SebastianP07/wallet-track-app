import type { DashboardSectionId } from "./sections";

export type DestinationId = "overview" | "accounts" | "expenses" | "income" | "cards" | "templates";

export interface DashboardDestination {
  id: DestinationId;
  // The section scrolled to and whose heading takes focus.
  target: DashboardSectionId;
  // The sections opened on the way, and the ones that mark the destination as current while in view.
  sections: readonly DashboardSectionId[];
}

// The bottom navigation, in the owner's order. Expenses lands on the fixed ones with the occasional right after.
export const DASHBOARD_DESTINATIONS: readonly DashboardDestination[] = [
  { id: "overview", target: "kpis", sections: ["kpis"] },
  { id: "accounts", target: "accounts", sections: ["accounts"] },
  { id: "expenses", target: "fixed-expenses", sections: ["fixed-expenses", "occasional-expenses"] },
  { id: "income", target: "income", sections: ["income"] },
  { id: "cards", target: "card-charges", sections: ["card-charges"] },
  { id: "templates", target: "templates", sections: ["templates"] },
];

// The destination a section in view belongs to, if any.
export function destinationOf(id: DashboardSectionId): DestinationId | null {
  return DASHBOARD_DESTINATIONS.find((destination) => destination.sections.includes(id))?.id ?? null;
}
