import type { Template, TemplateList } from "./types";

const PENDING_ID_PREFIX = "pending-";

let pendingCount = 0;

// A row the server has not confirmed. Its id means nothing there, so it cannot be edited yet.
export function pendingTemplateId(): string {
  pendingCount += 1;
  return `${PENDING_ID_PREFIX}${pendingCount}`;
}

export function isPendingTemplate(template: Template): boolean {
  return template.id.startsWith(PENDING_ID_PREFIX);
}

export function withTemplate(
  list: TemplateList,
  template: Template,
  index = list.items.length,
): TemplateList {
  const items = [...list.items];
  items.splice(index, 0, template);
  return { ...list, items };
}

export function withReplacedTemplate(list: TemplateList, id: string, template: Template): TemplateList {
  return { ...list, items: list.items.map((item) => (item.id === id ? template : item)) };
}

export function withoutTemplate(list: TemplateList, id: string): TemplateList {
  return { ...list, items: list.items.filter((item) => item.id !== id) };
}
