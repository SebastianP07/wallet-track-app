"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { Tag, TagUpdate } from "../../domain/types";
import { TagLabel } from "./tag-label";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

const TagForm = dynamic(() => import("./tag-form").then((module) => module.TagForm));

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
  const { common, expenses, tags: t } = useMessages();
  const toView = () => setMode("view");

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <TagLabel name={tag.name} color={tag.color} />

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button variant="link" className={ACTION} aria-label={t.editTag(tag.name)} onClick={() => setMode("edit")}>
            {common.edit}
          </Button>
          <Button
            variant="link"
            className={ACTION}
            aria-label={t.deleteTag(tag.name)}
            onClick={() => setMode("confirm-delete")}
          >
            {common.delete}
          </Button>
        </div>
      ) : null}

      {mode === "edit" ? (
        <TagForm
          defaultValues={{ name: tag.name, color: tag.color }}
          submitLabel={expenses.saveChanges}
          pending={isUpdating}
          onCancel={toView}
          onSubmit={(changes) => onUpdate(changes, { onSuccess: toView })}
        />
      ) : null}

      {mode === "confirm-delete" ? (
        <ConfirmPanel
          confirmLabel={common.delete}
          onConfirm={() => {
            onDelete();
            toView();
          }}
          onKeep={toView}
        >
          {t.deleteBefore}
          <span className="font-medium wrap-anywhere">{tag.name}</span>
          {t.deleteAfter}
        </ConfirmPanel>
      ) : null}
    </li>
  );
}
