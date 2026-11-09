import type { OrderedKind, PeriodItemList } from "./types";

// D13: a section lists its done items first, then the rest, each group in the manual order the API sends. Grouping is
// by status only: the client never invents an order of its own (D1).
interface Orderable {
  id: string;
  status: string;
}

export type OrderGroup = "done" | "open";

export function groupOf(item: Orderable): OrderGroup {
  return item.status === "done" ? "done" : "open";
}

export function doneFirst<Item extends Orderable>(items: Item[]): Item[] {
  return [...items.filter((item) => groupOf(item) === "done"), ...items.filter((item) => groupOf(item) === "open")];
}

// The first and last displayed index the item at index can move to: an item stays in its own group, since moving it
// changes its order, never its status.
export function groupBounds(displayed: Orderable[], index: number): [number, number] {
  const group = groupOf(displayed[index]!);
  const first = displayed.findIndex((item) => groupOf(item) === group);
  const count = displayed.filter((item) => groupOf(item) === group).length;
  return [first, first + count - 1];
}

export function clampToGroup(displayed: Orderable[], from: number, to: number): number {
  const [first, last] = groupBounds(displayed, from);
  return Math.min(Math.max(to, first), last);
}

export function moveItem<Item extends Orderable>(displayed: Item[], from: number, to: number): Item[] {
  const target = clampToGroup(displayed, from, to);
  const next = [...displayed];
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved!);
  return next;
}

// What the API stores after a move. Each group's items take back the places they held in the stored order, in their new
// displayed order, so the other group keeps its places: marking an item done or not later puts it back where it was
// among the others, and the next month, where nothing is done yet, shows exactly the order the owner arranged.
export function storedOrder(stored: Orderable[], displayed: Orderable[]): string[] {
  const queues: Record<OrderGroup, string[]> = {
    done: displayed.filter((item) => groupOf(item) === "done").map((item) => item.id),
    open: displayed.filter((item) => groupOf(item) === "open").map((item) => item.id),
  };
  return stored.map((item) => queues[groupOf(item)].shift() ?? item.id);
}

// The cached month list with one kind's items in the order of ids, in the places that kind's items already hold.
export function withKindOrder(list: PeriodItemList, kind: OrderedKind, ids: string[]): PeriodItemList {
  const ofKind = list.items.filter((item) => item.kind === kind);
  const rank = new Map(ids.map((id, index) => [id, index]));
  // An item the order does not name, such as one added meanwhile, keeps its place after the named ones.
  const ordered = [...ofKind].sort((a, b) => (rank.get(a.id) ?? ids.length) - (rank.get(b.id) ?? ids.length));
  let next = 0;
  return { ...list, items: list.items.map((item) => (item.kind === kind ? ordered[next++]! : item)) };
}
