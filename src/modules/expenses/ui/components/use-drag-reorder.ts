"use client";

import { useEffect, useRef, type PointerEvent, type RefObject } from "react";
import { flushSync } from "react-dom";

// How far a press has to travel before it counts as a drag, so a tap on the handle stays a tap.
const DRAG_THRESHOLD_PX = 6;
// Near the viewport's top or bottom edge a drag scrolls the page, faster the closer it gets.
const EDGE_PX = 72;
const MAX_SCROLL_PX = 14;
const SHIFT_TRANSITION = "transform 150ms ease";

interface Row {
  element: HTMLElement;
  top: number;
  height: number;
}

interface Drag {
  pointerId: number;
  handle: HTMLElement;
  from: number;
  bounds: [number, number];
  startPageY: number;
  clientY: number;
  rows: Row[];
  target: number;
  started: boolean;
  scrollFrame: number | null;
}

interface DragOptions {
  listRef: RefObject<HTMLElement | null>;
  // Where an item at a displayed index may go: its own group (D13).
  boundsOf: (index: number) => [number, number];
  onDrop: (from: number, to: number) => void;
}

function rowsOf(list: HTMLElement): Row[] {
  return [...list.querySelectorAll<HTMLElement>(":scope > [data-item-id]")].map((element) => {
    const rect = element.getBoundingClientRect();
    return { element, top: rect.top + window.scrollY, height: rect.height };
  });
}

function clearStyles(drag: Drag) {
  for (const { element } of drag.rows) {
    element.style.transition = "none";
    element.style.transform = "";
    delete element.dataset.dragging;
  }
  document.documentElement.style.removeProperty("user-select");
}

// Pointer events only, for mouse, pen and touch alike: the handle takes the pointer, the row follows it and the
// rows it passes make room. The page keeps scrolling everywhere but the handle, which has touch-action: none.
// Nothing renders while a drag is on: rows move by transform, and React only sees the drop.
export function useDragReorder({ listRef, boundsOf, onDrop }: DragOptions) {
  const dragRef = useRef<Drag | null>(null);
  // A drag ends in a click on the handle, which must not count as pressing it.
  const draggedRef = useRef(false);

  const layout = (drag: Drag) => {
    const dy = drag.clientY + window.scrollY - drag.startPageY;
    const moving = drag.rows[drag.from]!;
    moving.element.style.transform = `translateY(${dy}px)`;
    const center = moving.top + moving.height / 2 + dy;
    const [first, last] = drag.bounds;
    let target = first;
    for (let index = first; index <= last; index += 1) {
      const row = drag.rows[index]!;
      if (index !== drag.from && row.top + row.height / 2 < center) {
        target += 1;
      }
    }
    drag.target = target;
    drag.rows.forEach((row, index) => {
      if (index === drag.from) {
        return;
      }
      const shift =
        drag.from < index && index <= target ? -moving.height : target <= index && index < drag.from ? moving.height : 0;
      row.element.style.transform = shift ? `translateY(${shift}px)` : "";
    });
  };

  const autoScroll = (drag: Drag) => {
    drag.scrollFrame = null;
    const fromTop = drag.clientY;
    const fromBottom = window.innerHeight - drag.clientY;
    const speed =
      fromTop < EDGE_PX
        ? -Math.ceil(((EDGE_PX - fromTop) / EDGE_PX) * MAX_SCROLL_PX)
        : fromBottom < EDGE_PX
          ? Math.ceil(((EDGE_PX - fromBottom) / EDGE_PX) * MAX_SCROLL_PX)
          : 0;
    if (speed === 0 || dragRef.current !== drag) {
      return;
    }
    window.scrollBy(0, speed);
    layout(drag);
    drag.scrollFrame = requestAnimationFrame(() => autoScroll(drag));
  };

  const end = (drop: boolean) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    dragRef.current = null;
    if (drag.scrollFrame !== null) {
      cancelAnimationFrame(drag.scrollFrame);
    }
    if (drag.handle.hasPointerCapture(drag.pointerId)) {
      drag.handle.releasePointerCapture(drag.pointerId);
    }
    if (!drag.started) {
      return;
    }
    draggedRef.current = true;
    setTimeout(() => {
      draggedRef.current = false;
    });
    // The new order is in the DOM before the transforms go, so no frame shows the rows in the old order.
    if (drop && drag.target !== drag.from) {
      flushSync(() => onDrop(drag.from, drag.target));
    }
    clearStyles(drag);
  };

  // A list that leaves the page mid-drag leaves nothing moved behind.
  useEffect(
    () => () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (drag) {
        if (drag.scrollFrame !== null) {
          cancelAnimationFrame(drag.scrollFrame);
        }
        clearStyles(drag);
      }
    },
    [],
  );

  const handleProps = (index: number) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      const handle = event.currentTarget;
      const list = listRef.current;
      if (!list || dragRef.current || handle.matches(":disabled") || (event.pointerType === "mouse" && event.button !== 0)) {
        return;
      }
      if (event.pointerType === "mouse") {
        // Keeps a mouse drag from selecting the text it passes over; focus then has to be given by hand.
        event.preventDefault();
        handle.focus({ preventScroll: true });
      }
      handle.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        handle,
        from: index,
        bounds: boundsOf(index),
        startPageY: event.clientY + window.scrollY,
        clientY: event.clientY,
        rows: rowsOf(list),
        target: index,
        started: false,
        scrollFrame: null,
      };
    },
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) {
        return;
      }
      drag.clientY = event.clientY;
      if (!drag.started) {
        if (Math.abs(event.clientY + window.scrollY - drag.startPageY) < DRAG_THRESHOLD_PX) {
          return;
        }
        drag.started = true;
        document.documentElement.style.setProperty("user-select", "none");
        drag.rows.forEach((row, rowIndex) => {
          row.element.style.transition = rowIndex === drag.from ? "none" : SHIFT_TRANSITION;
        });
        drag.rows[drag.from]!.element.dataset.dragging = "true";
      }
      layout(drag);
      if (drag.scrollFrame === null) {
        drag.scrollFrame = requestAnimationFrame(() => autoScroll(drag));
      }
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      if (dragRef.current?.pointerId === event.pointerId) {
        end(true);
      }
    },
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => {
      if (dragRef.current?.pointerId === event.pointerId) {
        end(false);
      }
    },
    onLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => {
      if (dragRef.current?.pointerId === event.pointerId) {
        end(true);
      }
    },
  });

  return { handleProps, wasDragged: () => draggedRef.current };
}
