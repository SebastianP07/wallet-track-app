"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const START_LOADING_BEFORE_IT_SHOWS = "200px";

export function ChartPlaceholder() {
  return <div className="ledger-rows h-full" />;
}

interface DeferredChartProps {
  className: string;
  children: ReactNode;
}

// Recharts is the heaviest code the Dashboard runs, so it waits until a chart nears the screen. The chart is hidden
// from assistive technology, and the table beside it, which says everything it says, does not wait.
export function DeferredChart({ className, children }: DeferredChartProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: START_LOADING_BEFORE_IT_SHOWS },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} aria-hidden="true" className={className}>
      {isNear ? children : <ChartPlaceholder />}
    </div>
  );
}
