const PENDING_ID_PREFIX = "pending-";

let pendingCount = 0;

// A row the server has not confirmed. Its id means nothing there, so it cannot be edited yet.
export function pendingRowId(): string {
  pendingCount += 1;
  return `${PENDING_ID_PREFIX}${pendingCount}`;
}

export function isPendingRow(row: { id: string }): boolean {
  return row.id.startsWith(PENDING_ID_PREFIX);
}

// These change the rows only. Anything else in the list stays as the backend last sent it (D1).
export function withRow<Row, List extends { items: Row[] }>(
  list: List,
  row: Row,
  index = list.items.length,
): List {
  const items = [...list.items];
  items.splice(index, 0, row);
  return { ...list, items };
}

export function withReplacedRow<Row extends { id: string }, List extends { items: Row[] }>(
  list: List,
  id: string,
  row: Row,
): List {
  return { ...list, items: list.items.map((item) => (item.id === id ? row : item)) };
}

export function withoutRow<Row extends { id: string }, List extends { items: Row[] }>(
  list: List,
  id: string,
): List {
  return { ...list, items: list.items.filter((item) => item.id !== id) };
}
