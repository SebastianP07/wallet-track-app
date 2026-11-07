"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { DEFAULT_TAG_COLOR } from "../../domain/tag-forms";
import type { Tag, TagCreate, TagUpdate } from "../../domain/types";
import { TagRow } from "./tag-row";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

const TagForm = dynamic(() => import("./tag-form").then((module) => module.TagForm));

interface TagSectionProps {
  tags: Tag[];
  isLoading: boolean;
  loadFailed: boolean;
  refreshFailed: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  failure: string | null;
  reload: () => void;
  createTag: (tag: TagCreate, callbacks: { onSuccess: () => void }) => void;
  updateTag: (id: string, changes: TagUpdate, callbacks: { onSuccess: () => void }) => void;
  deleteTag: (id: string) => void;
}

export function TagSection({
  tags,
  isLoading,
  loadFailed,
  refreshFailed,
  isCreating,
  isUpdating,
  failure,
  reload,
  createTag,
  updateTag,
  deleteTag,
}: TagSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <div role="status" className="ledger-rows flex h-18 items-end">
        <p className="pb-2 font-mono text-xs text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message="The tags could not be loaded." />
        <Button variant="outline" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <FormAlert message={failure} />
      {refreshFailed ? (
        <p className="text-sm text-muted-foreground">
          Showing the last tags received; they could not be refreshed.
        </p>
      ) : null}

      {tags.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-muted-foreground">
          No tags yet. Add one to group expenses and income your way.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              isUpdating={isUpdating}
              onUpdate={(changes, callbacks) => updateTag(tag.id, changes, callbacks)}
              onDelete={() => deleteTag(tag.id)}
            />
          ))}
        </ul>
      )}

      {isAdding ? (
        <div className="border-t border-rule pt-3">
          <TagForm
            defaultValues={{ name: "", color: DEFAULT_TAG_COLOR }}
            submitLabel="Save"
            pending={isCreating}
            onCancel={() => setIsAdding(false)}
            onSubmit={(tag) => createTag(tag, { onSuccess: () => setIsAdding(false) })}
          />
        </div>
      ) : (
        <Button variant="outline" className="mt-auto lg:self-start" onClick={() => setIsAdding(true)}>
          Add tag
        </Button>
      )}
    </div>
  );
}
