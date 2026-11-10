// What a closed section shows beside its title, from data the page already holds: how many items it has and,
// where the section has one, the amount it adds up to. An alert summary asks to be seen, as overdue items do.
export interface SectionSummary {
  count: number;
  amount: number | null;
  alert: boolean;
}
