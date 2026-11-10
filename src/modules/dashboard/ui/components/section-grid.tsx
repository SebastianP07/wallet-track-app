"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  DASHBOARD_SECTIONS,
  isCollapsible,
  mountsWhenOpened,
  type DashboardSectionId,
} from "../../domain/sections";
import type { SectionSummary } from "../../domain/section-summary";
import { SectionFrame } from "./section-frame";
import { formatCOP } from "@/modules/accounts/domain/money";
import { useMessages } from "@/shared/i18n/use-i18n";

// Stacked on mobile. Wider screens pair sections of like height, so no row is held open by one tall
// neighbour, and the two longest of a pair take the wider slot.
const SPANS: Record<DashboardSectionId, string> = {
  kpis: "md:col-span-6 lg:col-span-12",
  charts: "md:col-span-6 lg:col-span-12",
  accounts: "md:col-span-6 lg:col-span-12",
  "fixed-expenses": "md:col-span-3 lg:col-span-7",
  "occasional-expenses": "md:col-span-3 lg:col-span-5",
  income: "md:col-span-3 lg:col-span-7",
  overdue: "md:col-span-3 lg:col-span-5",
  "card-charges": "md:col-span-3 lg:col-span-5",
  platforms: "md:col-span-3 lg:col-span-7",
  templates: "md:col-span-6 lg:col-span-8",
  tags: "md:col-span-6 lg:col-span-4",
  security: "md:col-span-6 lg:col-span-12",
};

const SECTIONS_IN_FIRST_RENDER = 1;

type SummaryFormat = (count: number, amount: string) => string;

// One section at a time, each in its own task, so that a phone is never blocked until all of them have rendered.
// All are in the page within a moment, so Tab and find-in-page reach everything.
function useSectionsToRender(total: number): number {
  const [count, setCount] = useState(SECTIONS_IN_FIRST_RENDER);
  useEffect(() => {
    if (count >= total) {
      return;
    }
    const timer = setTimeout(() => setCount(count + 1));
    return () => clearTimeout(timer);
  }, [count, total]);
  return count;
}

interface SectionGridProps {
  sections: Record<DashboardSectionId, ReactNode>;
  summaries: Partial<Record<DashboardSectionId, SectionSummary>>;
  // Open sections, and those opened at least once, which keep what they mounted.
  openIds: ReadonlySet<DashboardSectionId>;
  openedIds: ReadonlySet<DashboardSectionId>;
  // Offline, the toggles are disabled with every other control, so the sections show open.
  allOpen: boolean;
  onToggle: (id: DashboardSectionId) => void;
}

export function SectionGrid({ sections, summaries, openIds, openedIds, allOpen, onToggle }: SectionGridProps) {
  const sectionsToRender = useSectionsToRender(DASHBOARD_SECTIONS.length);
  const t = useMessages().dashboard;
  const formats: Partial<Record<DashboardSectionId, SummaryFormat>> = t.summaries;

  const summaryOf = (id: DashboardSectionId) => {
    const summary = summaries[id];
    const format = formats[id];
    if (!summary || !format) {
      return null;
    }
    return { text: format(summary.count, formatCOP(summary.amount ?? 0)), alert: summary.alert };
  };

  return (
    <div className="rise-in-children grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-6 lg:grid-cols-12">
      {DASHBOARD_SECTIONS.map((id, index) => {
        const collapsible = isCollapsible(id);
        const isDeferred = mountsWhenOpened(id) && !openedIds.has(id);
        // Offline, a deferred section that never opened stays closed: its code may not be in the page, and
        // fetching it would fail and take the whole Dashboard down.
        const isOpen = !collapsible || openIds.has(id) || (allOpen && !isDeferred);
        const isMounted = index < sectionsToRender && (!isDeferred || isOpen);
        return (
          <SectionFrame
            key={id}
            section={{ id, ...t.sections[id] }}
            position={index + 1}
            className={SPANS[id]}
            toggle={collapsible ? { isOpen, summary: summaryOf(id), onToggle: () => onToggle(id) } : undefined}
          >
            {isMounted ? sections[id] : null}
          </SectionFrame>
        );
      })}
    </div>
  );
}
