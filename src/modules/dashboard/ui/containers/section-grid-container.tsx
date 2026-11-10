"use client";

import type { ComponentProps } from "react";

import { useSectionSummaries } from "../../application/use-section-summaries";
import { SectionGrid } from "../components/section-grid";

type SectionGridContainerProps = Omit<ComponentProps<typeof SectionGrid>, "summaries"> & {
  period: string;
  tagId: string | null;
};

// Its own component, so that the summaries changing with every write re-render the grid alone.
export function SectionGridContainer({ period, tagId, ...grid }: SectionGridContainerProps) {
  const summaries = useSectionSummaries(period, tagId);
  return <SectionGrid summaries={summaries} {...grid} />;
}
