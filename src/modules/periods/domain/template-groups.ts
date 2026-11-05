import type { Template, TemplateKind } from "./types";

export const TEMPLATE_KINDS: readonly TemplateKind[] = ["fixed", "income", "card_charge"];

export const TEMPLATE_KIND_LABELS: Record<TemplateKind, string> = {
  fixed: "Fixed expense",
  income: "Income",
  card_charge: "Card charge",
};

export const TEMPLATE_GROUP_TITLES: Record<TemplateKind, string> = {
  fixed: "Fixed expenses",
  income: "Income",
  card_charge: "Card charges",
};

export function templatesOf(templates: Template[], kind: TemplateKind): Template[] {
  return templates.filter((template) => template.kind === kind);
}

export function needsCardToActivate(template: Template): boolean {
  return template.kind === "card_charge" && !template.cardId;
}
