"use client";

import { useEffect, useRef, type ReactNode } from "react";

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)';

function firstFocusable(node: Node | null): HTMLElement | null {
  if (!(node instanceof HTMLElement) || !node.isConnected) {
    return null;
  }
  return node.matches(FOCUSABLE) ? node : node.querySelector<HTMLElement>(FOCUSABLE);
}

function labelOf(element: HTMLElement): string {
  return element.getAttribute("aria-label") ?? element.textContent?.trim() ?? "";
}

function controlLabelled(within: Node, label: string | null): HTMLElement | null {
  if (!label || !(within instanceof HTMLElement)) {
    return null;
  }
  // A row's toggle sits outside the part of it that a form replaces.
  const scope = within.closest("li") ?? within;
  const controls = scope.querySelectorAll<HTMLElement>("button:not(:disabled)");
  return [...controls].find((control) => labelOf(control) === label) ?? null;
}

function sectionHeading(within: Node): HTMLElement | null {
  const parent = within instanceof HTMLElement ? within : within.parentElement;
  const section = parent?.closest("section");
  const heading = section?.querySelector<HTMLElement>("h3") ?? null;
  heading?.setAttribute("tabindex", "-1");
  return heading;
}

// The next place for focus when what held it left the page: the control that opened a form or a confirmation
// that has just closed, then what replaced it, then the next row, the previous one, anything else nearby and,
// in a section left empty, its heading.
function nextFocus(removal: MutationRecord, records: MutationRecord[], opener: string | null): HTMLElement | null {
  const replacements = records
    .filter((record) => record.target === removal.target)
    .flatMap((record) => [...record.addedNodes]);
  return (
    controlLabelled(removal.target, opener) ??
    replacements.map(firstFocusable).find(Boolean) ??
    firstFocusable(removal.nextSibling) ??
    firstFocusable(removal.previousSibling) ??
    firstFocusable(removal.target) ??
    sectionHeading(removal.target)
  );
}

// A browser drops focus to the page's start when the focused element leaves the DOM or turns disabled, as a button
// does while its write is on its way. Rows and forms here do both all the time, so one observer over the whole page
// returns focus wherever that happens.
export function FocusKeeper({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    let focused: HTMLElement | null = null;
    let previous: HTMLElement | null = null;
    let opener: string | null = null;

    const onFocusIn = (event: FocusEvent) => {
      previous = focused;
      focused = event.target as HTMLElement;
    };
    const onFocusOut = () => {
      setTimeout(() => {
        const left = focused?.isConnected && document.activeElement !== focused && !focused.matches(":disabled");
        if (left) {
          focused = null;
        }
      });
    };
    // The pointer took over: whatever happens to that element later is not its problem.
    const onPointerDown = () => {
      focused = null;
      previous = null;
    };

    const observer = new MutationObserver((records) => {
      // A confirmation's autoFocus runs before this does, so what opened it is already the previous element.
      if (previous && !previous.isConnected && previous.matches("button")) {
        opener = labelOf(previous);
        previous = null;
      }
      const held = focused;
      if (!held) {
        return;
      }
      const isDropped = document.activeElement === null || document.activeElement === document.body;
      if (held.isConnected) {
        // Back from disabled, or reinserted by React elsewhere.
        if (isDropped && !held.matches(":disabled")) {
          held.focus();
        }
        return;
      }
      const removal = records.find((record) => [...record.removedNodes].some((node) => node.contains(held)));
      if (!removal) {
        return;
      }
      if (isDropped) {
        nextFocus(removal, records, opener)?.focus();
      }
      if (held.matches("button")) {
        opener = labelOf(held);
      }
    });

    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    document.addEventListener("pointerdown", onPointerDown);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    return () => {
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("pointerdown", onPointerDown);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
}
