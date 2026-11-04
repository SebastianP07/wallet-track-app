import { cn } from "cn";

import type { DashboardSection } from "../../domain/sections";

const ROW_HEIGHT = { 2: "h-18", 4: "h-36", 6: "h-54" } as const;

interface SectionPlaceholderProps {
  section: DashboardSection;
  position: number;
  className?: string;
}

export function SectionPlaceholder({ section, position, className }: SectionPlaceholderProps) {
  const headingId = `${section.id}-heading`;
  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-3 bg-background p-4 sm:p-5", className)}
    >
      <header className="flex items-baseline gap-3">
        <span aria-hidden="true" className="font-mono text-xs text-signal">
          {String(position).padStart(2, "0")}
        </span>
        <h3 id={headingId} className="font-heading text-lg font-semibold">
          {section.title}
        </h3>
      </header>
      <p className="text-sm text-muted-foreground">{section.description}</p>
      <div className={cn("ledger-rows mt-auto flex items-end", ROW_HEIGHT[section.rows])}>
        <p className="pb-2 font-mono text-xs text-muted-foreground">Nothing here yet</p>
      </div>
    </section>
  );
}
