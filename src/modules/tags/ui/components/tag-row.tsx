"use client";

import { useState } from "react";

import type { Tag, TagUpdate } from "../../domain/types";
import { TagForm } from "./tag-form";
import { TagLabel } from "./tag-label";
import { Button } from "@/shared/ui/button";

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "edit" | "confirm-delete";

interface TagRowProps {
  tag: Tag;
  isUpdating: boolean;
  onUpdate: (changes: TagUpdate, callbacks: { onSuccess: () => void }) => void;
  onDelete: () => void;
}

export function TagRow({ tag, isUpdating, onUpdate, onDelete }: TagRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const toView = () => setMode("view");

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <TagLabel name={tag.name} color={tag.color} />

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button variant="link" className={ACTION} aria-label={`Edit tag ${tag.name}`} onClick={() => setMode("edit")}>
            Edit
          </Button>
          <Button
            variant="link"
            className={ACTION}
            aria-label={`Delete tag ${tag.name}`}
            onClick={() => setMode("confirm-delete")}
          >
            Delete
          </Button>
        </div>
      ) : null}

      {mode === "edit" ? (
        <TagForm
          defaultValues={{ name: tag.name, color: tag.color }}
          submitLabel="Save changes"
          pending={isUpdating}
          onCancel={toView}
          onSubmit={(changes) => onUpdate(changes, { onSuccess: toView })}
        />
      ) : null}

      {mode === "confirm-delete" ? (
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-sm">
            Delete <span className="font-medium wrap-anywhere">{tag.name}</span> for good? Items and
            templates that have it stay, without a tag.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                onDelete();
                toView();
              }}
            >
              Delete
            </Button>
            <Button variant="outline" className="flex-1" onClick={toView}>
              Keep it
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
