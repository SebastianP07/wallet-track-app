import type { Template, TemplateKind } from "./types";

export const TEMPLATE_KINDS: readonly TemplateKind[] = ["fixed", "income", "card_charge"];

export function templatesOf(templates: Template[], kind: TemplateKind): Template[] {
  return templates.filter((template) => template.kind === kind);
}

export function needsCardToActivate(template: Template): boolean {
  return template.kind === "card_charge" && !template.cardId;
}
