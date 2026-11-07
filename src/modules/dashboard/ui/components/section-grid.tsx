"use client";

import { useEffect, useState, type ReactNode } from "react";

import { DASHBOARD_SECTIONS } from "../../domain/sections";
import { SectionFrame } from "./section-frame";

// Stacked on mobile. Wider screens pair sections of like height, so no row is held open by one tall
// neighbour, and the two longest of a pair take the wider slot.
const SPANS: Record<string, string> = {
  kpis: "md:col-span-6 lg:col-span-12",
  charts: "md:col-span-6 lg:col-span-12",
  accounts: "md:col-span-3 lg:col-span-7",
  savings: "md:col-span-3 lg:col-span-5",
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
  sections: Record<string, ReactNode>;
}

export function SectionGrid({ sections }: SectionGridProps) {
  const sectionsToRender = useSectionsToRender(DASHBOARD_SECTIONS.length);
  return (
    <div className="rise-in-children grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-6 lg:grid-cols-12">
      {DASHBOARD_SECTIONS.map((section, index) => (
        <SectionFrame
          key={section.id}
          section={section}
          position={index + 1}
          className={SPANS[section.id]}
        >
          {index < sectionsToRender ? sections[section.id] : null}
        </SectionFrame>
      ))}
    </div>
  );
}
