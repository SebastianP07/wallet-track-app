"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GripVertical } from "lucide-react";

import { clampToGroup, doneFirst, groupBounds, moveItem, storedOrder } from "../../domain/item-order";
import type { PeriodItem } from "../../domain/types";
import { useDragReorder } from "./use-drag-reorder";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

// What a row shows to be moved: the handle beside its toggle and, while it is being moved by buttons, Up and Down.
export interface RowReorder {
  handle: ReactNode;
  controls: ReactNode;
}

type FocusRole = "toggle" | "handle" | "up" | "down";

interface FocusTarget {
  id: string;
  role: FocusRole;
}

interface ReorderableItemListProps {
  // One kind's items in the order the API sent (D13).
  items: PeriodItem[];
  // False while the list shows only some of the kind's items, or one the server has not confirmed yet.
  canReorder: boolean;
  // Every item of the kind, in the order to store.
  onReorder: (ids: string[]) => void;
  renderRow: (item: PeriodItem, reorder: RowReorder | undefined) => ReactNode;
}

function findControl(list: HTMLElement | null, target: FocusTarget): HTMLElement | null {
  const row = [...(list?.querySelectorAll<HTMLElement>(":scope > [data-item-id]") ?? [])].find(
    (element) => element.dataset.itemId === target.id,
  );
  return row?.querySelector<HTMLElement>(`[data-focus-role="${target.role}"]`) ?? null;
}

// Done items first, then the rest, each in the stored order; a move stays within its group (D13). Keyboard focus
// follows the control it was on when its row moves, whether a toggle sent it to the other group or a move did.
export function ReorderableItemList({ items, canReorder, onReorder, renderRow }: ReorderableItemListProps) {
  const t = useMessages().expenses.order;
  const listRef = useRef<HTMLUListElement>(null);
  const instructionsId = useId();
  // The order of the last move, shown until the cached list it was made on is replaced.
  const [moved, setMoved] = useState<{ base: PeriodItem[]; ids: string[] } | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const focusAfterMove = useRef<FocusTarget | null>(null);
  const lastFocus = useRef<FocusTarget | null>(null);

  const displayed = useMemo(() => {
    if (moved?.base === items) {
      const byId = new Map(items.map((item) => [item.id, item]));
      return moved.ids.map((id) => byId.get(id)!);
    }
    return doneFirst(items);
  }, [items, moved]);

  // The pointer went elsewhere on the page: focus is no longer this list's to give back.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!listRef.current?.contains(event.target as Node)) {
        lastFocus.current = null;
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // A row that moved in the DOM has lost focus, as has a control that went away; this gives it back before the
  // browser paints.
  useLayoutEffect(() => {
    const dropped = document.activeElement === null || document.activeElement === document.body;
    const target = focusAfterMove.current ?? (dropped ? lastFocus.current : null);
    focusAfterMove.current = null;
    const control = target ? findControl(listRef.current, target) : null;
    if (control && document.activeElement !== control) {
      control.focus();
    }
  }, [displayed, movingId]);

  // The same words twice in a row would not be read again, so every other one ends in a no-break space.
  const announce = (text: string) => setAnnouncement((previous) => (previous === text ? `${text} ` : text));

  const commit = (from: number, to: number) => {
    const next = moveItem(displayed, from, to);
    setMoved({ base: items, ids: next.map((item) => item.id) });
    onReorder(storedOrder(items, next));
    announce(t.moved(next[to]!.name, to + 1, next.length));
  };

  const step = (id: string, delta: -1 | 1, role: FocusRole) => {
    const from = displayed.findIndex((item) => item.id === id);
    const to = clampToGroup(displayed, from, from + delta);
    const { name } = displayed[from]!;
    if (to === from) {
      announce((delta < 0 ? t.atTop : t.atBottom)(name, from + 1, displayed.length));
      return;
    }
    focusAfterMove.current = { id, role };
    commit(from, to);
  };

  const { handleProps, wasDragged } = useDragReorder({
    listRef,
    boundsOf: (index) => groupBounds(displayed, index),
    onDrop: (from, to) => {
      focusAfterMove.current = { id: displayed[from]!.id, role: "handle" };
      commit(from, to);
    },
  });

  const reorderOf = (item: PeriodItem, index: number): RowReorder | undefined => {
    if (!canReorder) {
      return undefined;
    }
    const isMoving = movingId === item.id;
    const handle = (
      <button
        type="button"
        data-focus-role="handle"
        aria-label={t.handle(item.name)}
        aria-describedby={instructionsId}
        aria-expanded={isMoving}
        className="-ml-2 flex h-12 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground select-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        {...handleProps(index)}
        onClick={() => {
          if (!wasDragged()) {
            setMovingId(isMoving ? null : item.id);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            step(item.id, event.key === "ArrowUp" ? -1 : 1, "handle");
          } else if (event.key === "Escape" && isMoving) {
            setMovingId(null);
          }
        }}
      >
        <GripVertical aria-hidden="true" className="size-5" />
      </button>
    );
    const controls = isMoving ? (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="min-h-11 px-3 text-sm"
          data-focus-role="up"
          aria-label={t.upAria(item.name)}
          onClick={() => step(item.id, -1, "up")}
        >
          {t.up}
        </Button>
        <Button
          variant="outline"
          className="min-h-11 px-3 text-sm"
          data-focus-role="down"
          aria-label={t.downAria(item.name)}
          onClick={() => step(item.id, 1, "down")}
        >
          {t.down}
        </Button>
        <Button
          variant="link"
          className="min-h-11 px-2 text-sm"
          aria-label={t.doneAria(item.name)}
          onClick={() => {
            focusAfterMove.current = { id: item.id, role: "handle" };
            setMovingId(null);
          }}
        >
          {t.done}
        </Button>
      </div>
    ) : null;
    return { handle, controls };
  };

  return (
    <>
      <ul
        ref={listRef}
        className="flex flex-col"
        onFocus={(event) => {
          const control = event.target.closest<HTMLElement>("[data-focus-role]");
          const row = event.target.closest<HTMLElement>("[data-item-id]");
          lastFocus.current =
            control && row ? { id: row.dataset.itemId!, role: control.dataset.focusRole as FocusRole } : null;
        }}
      >
        {displayed.map((item, index) => renderRow(item, reorderOf(item, index)))}
      </ul>
      {canReorder ? (
        <p id={instructionsId} hidden>
          {t.instructions}
        </p>
      ) : null}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
