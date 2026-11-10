"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import {
  DASHBOARD_DESTINATIONS,
  destinationOf,
  type DestinationId,
} from "../../domain/destinations";
import { DASHBOARD_SECTIONS, type DashboardSectionId } from "../../domain/sections";

// Space left above a section scrolled to, below anything stuck to the top of the page.
const SCROLL_GAP_PX = 12;
// A section is in view while it crosses this line, a third of the way down the viewport.
const IN_VIEW_MARGIN = "-33% 0px -66% 0px";
// How long a scroll the navigation started may take before the line takes over again, where `scrollend` is missing.
const NAVIGATION_SCROLL_MS = 1200;

interface OpenState {
  open: ReadonlySet<DashboardSectionId>;
  // Every section opened at least once, so that what mounted on opening is not thrown away on closing.
  opened: ReadonlySet<DashboardSectionId>;
}

const ALL_CLOSED: OpenState = { open: new Set(), opened: new Set() };

function withOpened(state: OpenState, ids: readonly DashboardSectionId[]): OpenState {
  if (ids.every((id) => state.open.has(id))) {
    return state;
  }
  return { open: new Set([...state.open, ...ids]), opened: new Set([...state.opened, ...ids]) };
}

// The height of whatever is stuck to the top, such as the offline notice, so a section never lands under it.
function stickyTopHeight(): number {
  return [...document.querySelectorAll<HTMLElement>("[data-sticky-top]")].reduce(
    (height, element) => height + element.getBoundingClientRect().height,
    0,
  );
}

// Which sections are open, which destination of the bottom navigation is in view, and the move to one: it opens
// the destination's sections, scrolls the first to the top and puts focus on its heading, as following a link to
// it would.
export function useSectionNavigation() {
  const [state, setState] = useState<OpenState>(ALL_CLOSED);
  const [current, setCurrent] = useState<DestinationId | null>(null);
  // While a scroll the navigation started runs, the sections it passes are not where the owner is going.
  const isNavigating = useRef(false);
  const endNavigation = useRef<(() => void) | null>(null);

  const toggle = useCallback((id: DashboardSectionId) => {
    setState((previous) => {
      if (!previous.open.has(id)) {
        return withOpened(previous, [id]);
      }
      const open = new Set(previous.open);
      open.delete(id);
      return { ...previous, open };
    });
  }, []);

  const goTo = useCallback((id: DestinationId) => {
    const destination = DASHBOARD_DESTINATIONS.find((candidate) => candidate.id === id);
    if (!destination) {
      return;
    }
    // Rendered open before measuring, so the scroll lands where the section now is.
    flushSync(() => setState((previous) => withOpened(previous, destination.sections)));
    const section = document.getElementById(destination.target);
    const heading = document.getElementById(`${destination.target}-heading`);
    if (!section) {
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = section.getBoundingClientRect().top + window.scrollY - stickyTopHeight() - SCROLL_GAP_PX;
    endNavigation.current?.();
    isNavigating.current = true;
    let timer = 0;
    const done = () => {
      isNavigating.current = false;
      endNavigation.current = null;
      window.clearTimeout(timer);
      window.removeEventListener("scrollend", done);
    };
    endNavigation.current = done;
    timer = window.setTimeout(done, reduceMotion ? 100 : NAVIGATION_SCROLL_MS);
    window.addEventListener("scrollend", done);
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "instant" : "smooth" });
    heading?.focus({ preventScroll: true });
    setCurrent(destination.id);
  }, []);

  // The current destination follows the section crossing the line as the owner scrolls; on wide screens two
  // sections share a row, and the first in the page's order wins.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const crossing = new Set<DashboardSectionId>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as DashboardSectionId;
          if (entry.isIntersecting) {
            crossing.add(id);
          } else {
            crossing.delete(id);
          }
        }
        if (isNavigating.current) {
          return;
        }
        const first = DASHBOARD_SECTIONS.find((id) => crossing.has(id));
        setCurrent(first ? destinationOf(first) : null);
      },
      { rootMargin: IN_VIEW_MARGIN },
    );
    for (const id of DASHBOARD_SECTIONS) {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    }
    return () => observer.disconnect();
  }, []);

  return { openIds: state.open, openedIds: state.opened, current, toggle, goTo };
}
