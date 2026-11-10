import type { ReactNode } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { cn } from "cn";

import type { DashboardSection } from "../../domain/sections";

export interface SectionToggle {
  isOpen: boolean;
  // Shown only while closed.
  summary: { text: string; alert: boolean } | null;
  onToggle: () => void;
}

interface SectionFrameProps {
  section: DashboardSection;
  position: number;
  className?: string;
  // Absent for a section that is always open.
  toggle?: SectionToggle;
  children: ReactNode;
}

// An accordion section follows the WAI-ARIA pattern: its heading holds the button that opens it, and the panel is
// in the page while closed, hidden, so the button always has something to control. The heading takes focus when
// the bottom navigation brings the section into view.
export function SectionFrame({ section, position, className, toggle, children }: SectionFrameProps) {
  const headingId = `${section.id}-heading`;
  const panelId = `${section.id}-panel`;
  const number = (
    <span aria-hidden="true" className="font-mono text-xs text-signal">
      {String(position).padStart(2, "0")}
    </span>
  );
  const summary = toggle && !toggle.isOpen ? toggle.summary : null;
  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className={cn("flex min-w-0 flex-col gap-3 bg-background p-4 sm:p-5", className)}
    >
      <header className="flex items-baseline gap-3">
        {toggle ? (
          <h3 id={headingId} tabIndex={-1} className="min-w-0 flex-1 rounded-md font-heading text-lg font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <button
              type="button"
              aria-expanded={toggle.isOpen}
              aria-controls={panelId}
              onClick={toggle.onToggle}
              className="-m-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-3 rounded-md p-2 text-left hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default disabled:hover:bg-transparent"
            >
              {number}
              <span className="flex min-w-0 flex-1 flex-col">
                <span>{section.title}</span>
                {summary ? (
                  <span
                    className={cn(
                      "flex items-center gap-1.5 font-sans text-sm font-normal",
                      summary.alert ? "text-due" : "text-muted-foreground",
                    )}
                  >
                    {summary.alert ? <TriangleAlert aria-hidden="true" className="size-4 shrink-0" /> : null}
                    <span className="min-w-0">{summary.text}</span>
                  </span>
                ) : null}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-5 shrink-0 text-muted-foreground transition-transform",
                  toggle.isOpen && "rotate-180",
                )}
              />
            </button>
          </h3>
        ) : (
          <>
            {number}
            <h3 id={headingId} tabIndex={-1} className="rounded-md font-heading text-lg font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              {section.title}
            </h3>
          </>
        )}
      </header>
      <div id={panelId} hidden={toggle ? !toggle.isOpen : undefined} className="flex min-w-0 flex-col gap-3">
        <p className="text-sm text-muted-foreground">{section.description}</p>
        {children}
      </div>
    </section>
  );
}
