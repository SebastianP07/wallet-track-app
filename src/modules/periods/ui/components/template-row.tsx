"use client";

import { useState } from "react";
import { cn } from "cn";

import { toTemplateUpdate } from "../../domain/template-forms";
import { isPendingTemplate } from "../../domain/optimistic-templates";
import { needsCardToActivate } from "../../domain/template-groups";
import type { Template, TemplateUpdate } from "../../domain/types";
import { TemplateForm, type CardChoices } from "./template-form";
import { formatCopInput, formatCOP } from "@/modules/accounts/domain/money";
import { Button } from "@/shared/ui/button";

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "edit" | "confirm-delete";

function detailOf(template: Template, cardChoices: CardChoices): string | null {
  switch (template.kind) {
    case "fixed":
      return `Due on day ${template.dueDay}`;
    case "income":
      return null;
    case "card_charge": {
      if (!template.cardId) {
        return "No card";
      }
      const card = cardChoices.cards.find(({ id }) => id === template.cardId);
      return card ? `On ${card.name}` : null;
    }
  }
}

interface TemplateRowProps {
  template: Template;
  cardChoices: CardChoices;
  onUpdate: (changes: TemplateUpdate) => void;
  onDelete: () => void;
}

export function TemplateRow({ template, cardChoices, onUpdate, onDelete }: TemplateRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const pending = isPendingTemplate(template);
  const blockedFromActivating = !template.active && needsCardToActivate(template);
  const toView = () => setMode("view");
  const detail = detailOf(template, cardChoices);

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex min-w-0 flex-col", !template.active && "opacity-60")}>
          <span className="font-medium wrap-anywhere">{template.name}</span>
          <span className="text-xs text-muted-foreground">
            {[detail, template.active ? null : "Inactive"].filter(Boolean).join(" · ")}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 text-right font-mono text-sm leading-6 whitespace-nowrap",
            !template.active && "opacity-60",
          )}
        >
          {formatCOP(template.amount)}
        </span>
      </div>

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button
            variant="link"
            className={ACTION}
            disabled={pending}
            aria-label={`Edit ${template.name}`}
            onClick={() => setMode("edit")}
          >
            Edit
          </Button>
          <Button
            variant="link"
            className={ACTION}
            disabled={pending || blockedFromActivating}
            aria-label={`${template.active ? "Deactivate" : "Activate"} ${template.name}`}
            onClick={() => onUpdate({ active: !template.active })}
          >
            {template.active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="link"
            className={ACTION}
            disabled={pending}
            aria-label={`Delete ${template.name}`}
            onClick={() => setMode("confirm-delete")}
          >
            Delete
          </Button>
        </div>
      ) : null}

      {mode === "view" && blockedFromActivating ? (
        <p className="text-xs text-muted-foreground">Edit it and choose a card to activate it.</p>
      ) : null}

      {mode === "edit" ? (
        <TemplateForm
          defaultValues={{
            kind: template.kind,
            name: template.name,
            amount: formatCopInput(template.amount),
            dueDay: template.dueDay === null ? "" : String(template.dueDay),
            cardId: template.cardId ?? "",
          }}
          canChooseKind={false}
          cardChoices={cardChoices}
          submitLabel="Save changes"
          onCancel={toView}
          onSubmit={(draft) => {
            onUpdate(toTemplateUpdate(draft));
            toView();
          }}
        />
      ) : null}

      {mode === "confirm-delete" ? (
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-sm">
            Delete <span className="font-medium wrap-anywhere">{template.name}</span> for good?
            Months already opened keep their items; months opened from now on won&apos;t get it.
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
