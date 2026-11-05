import type { ReactNode } from "react";
import { cn } from "cn";

import type { DashboardSection } from "../../domain/sections";

interface SectionFrameProps {
  section: DashboardSection;
  position: number;
  className?: string;
  children: ReactNode;
}

export function SectionFrame({ section, position, className, children }: SectionFrameProps) {
  const headingId = `${section.id}-heading`;
  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className={cn("flex min-w-0 flex-col gap-3 bg-background p-4 sm:p-5", className)}
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
      {children}
    </section>
  );
}
