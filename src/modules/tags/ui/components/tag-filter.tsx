"use client";

import { cn } from "cn";

import type { Tag } from "../../domain/types";
import { TagDot } from "./tag-label";

const CHIP =
  "inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function chipLook(selected: boolean) {
  return selected ? "border-signal text-signal" : "border-input text-muted-foreground hover:text-foreground";
}

interface TagFilterProps {
  tags: Tag[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

// Totals stay whole-month whichever chip is on (D5): the filter only narrows the rows.
export function TagFilter({ tags, selectedId, onChange }: TagFilterProps) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <div role="group" aria-label="Filter items by tag" className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Filter</span>
      <button
        type="button"
        aria-pressed={selectedId === null}
        className={cn(CHIP, chipLook(selectedId === null))}
        onClick={() => onChange(null)}
      >
        All
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
