// Queries one module owns and another has to refresh, so neither reaches into the other's hooks.
export const PERIODS_KEY = ["periods"];
export const RECURRING_TEMPLATES_KEY = ["recurring-templates"];
export const TAGS_KEY = ["tags"];
export const CREDIT_CARDS_KEY = ["credit-cards"];
export const PERIOD_ITEMS_KEY = ["period-items"];
// Under the items, so whatever refreshes every month's items refreshes this list too.
export const OVERDUE_ITEMS_KEY = [...PERIOD_ITEMS_KEY, "overdue"];
export const PLATFORMS_KEY = ["platforms"];
