import type { ReactNode } from "react";

import { DASHBOARD_SECTIONS } from "../../domain/sections";
import { SectionFrame } from "./section-frame";
import { SectionPlaceholder } from "./section-placeholder";

// Stacked on mobile; on larger screens the main money sections get the wider columns.
const SPANS: Record<string, string> = {
  kpis: "md:col-span-6 lg:col-span-12",
  charts: "md:col-span-6 lg:col-span-7",
  accounts: "md:col-span-6 lg:col-span-5",
  "fixed-expenses": "md:col-span-6 lg:col-span-7",
  "occasional-expenses": "md:col-span-3 lg:col-span-5",
  income: "md:col-span-3 lg:col-span-4",
  "card-charges": "md:col-span-3 lg:col-span-4",
  platforms: "md:col-span-3 lg:col-span-4",
  savings: "md:col-span-3 lg:col-span-5",
  overdue: "md:col-span-3 lg:col-span-7",
  templates: "md:col-span-6 lg:col-span-12",
};

interface SectionGridProps {
  // The sections that have been built, by section id; the rest stay placeholders.
  sections: Partial<Record<string, ReactNode>>;
}

export function SectionGrid({ sections }: SectionGridProps) {
  return (
    <div className="rise-in-children grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-6 lg:grid-cols-12">
      {DASHBOARD_SECTIONS.map((section, index) => (
        <SectionFrame
          key={section.id}
          section={section}
          position={index + 1}
          className={SPANS[section.id]}
        >
          {sections[section.id] ?? <SectionPlaceholder rows={section.rows} />}
        </SectionFrame>
      ))}
    </div>
  );
}
