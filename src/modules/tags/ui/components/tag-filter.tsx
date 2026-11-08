"use client";

import { cn } from "cn";

import type { Tag } from "../../domain/types";
import { TagDot } from "./tag-label";
import { useMessages } from "@/shared/i18n/use-i18n";

const CHIP =
  "inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

function chipLook(selected: boolean) {
  return selected ? "border-signal text-signal" : "border-input text-muted-foreground hover:text-foreground";
}

interface TagFilterProps {
  tags: Tag[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  isLoading?: boolean;
}

// Totals stay whole-month whichever chip is on (D5): the filter only narrows the rows.
export function TagFilter({ tags, selectedId, onChange, isLoading = false }: TagFilterProps) {
  const t = useMessages().tags;
  if (tags.length === 0) {
    // Holds a row of chips while the tags are on their way, so the page below does not jump when they arrive.
    return isLoading ? <div className="min-h-12" /> : null;
  }
  return (
    <div role="group" aria-label={t.filterGroup} className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{t.filter}</span>
      <button
        type="button"
        aria-pressed={selectedId === null}
        className={cn(CHIP, chipLook(selectedId === null))}
        onClick={() => onChange(null)}
      >
        {t.all}
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          aria-pressed={selectedId === tag.id}
          className={cn(CHIP, chipLook(selectedId === tag.id))}
          onClick={() => onChange(tag.id)}
        >
          <TagDot color={tag.color} />
          <span className="wrap-anywhere">{tag.name}</span>
        </button>
      ))}
    </div>
  );
}
