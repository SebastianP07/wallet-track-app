"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "cn";

import { toTemplateUpdate } from "../../domain/template-forms";
import { isPendingTemplate } from "../../domain/optimistic-templates";
import { needsCardToActivate } from "../../domain/template-groups";
import type { Template, TemplateUpdate } from "../../domain/types";
import { type CardChoices } from "./template-form";
import { formatCopInput, formatCOP } from "@/modules/accounts/domain/money";
import type { Tag } from "@/modules/tags/domain/types";
import { TagLabel } from "@/modules/tags/ui/components/tag-label";
import type { Messages } from "@/shared/i18n/messages";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

const TemplateForm = dynamic(() => import("./template-form").then((module) => module.TemplateForm));

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "edit" | "confirm-delete";

function detailOf(template: Template, cardChoices: CardChoices, t: Messages["periods"]["templates"]): string | null {
  switch (template.kind) {
    case "fixed":
      return t.dueOnDay(template.dueDay);
    case "income":
      return null;
    case "card_charge": {
      if (!template.cardId) {
        return t.noCard;
      }
      const card = cardChoices.cards.find(({ id }) => id === template.cardId);
      return card ? t.onCard(card.name) : null;
    }
  }
}

interface TemplateRowProps {
  template: Template;
  cardChoices: CardChoices;
  tags: Tag[];
  onUpdate: (changes: TemplateUpdate) => void;
  onDelete: () => void;
}

export function TemplateRow({ template, cardChoices, tags, onUpdate, onDelete }: TemplateRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const { common, expenses, periods } = useMessages();
  const t = periods.templates;
  const pending = isPendingTemplate(template);
  const blockedFromActivating = !template.active && needsCardToActivate(template);
  const toView = () => setMode("view");
  const detail = detailOf(template, cardChoices, t);
  const tag = tags.find(({ id }) => id === template.tagId);

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className={cn("font-medium wrap-anywhere", !template.active && "text-muted-foreground")}>{template.name}</span>
          <span className="text-xs text-muted-foreground">
            {[detail, template.active ? null : t.inactive].filter(Boolean).join(" · ")}
          </span>
          {tag ? <TagLabel name={tag.name} color={tag.color} /> : null}
        </div>
        <span
          className={cn(
            "shrink-0 text-right font-mono text-sm leading-6 whitespace-nowrap",
            !template.active && "text-muted-foreground",
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
            aria-label={expenses.editItem(template.name)}
            onClick={() => setMode("edit")}
          >
            {common.edit}
          </Button>
          <Button
            variant="link"
            className={ACTION}
            disabled={pending || blockedFromActivating}
            aria-label={template.active ? t.deactivateItem(template.name) : t.activateItem(template.name)}
            onClick={() => onUpdate({ active: !template.active })}
          >
            {template.active ? t.deactivate : t.activate}
          </Button>
          <Button
            variant="link"
            className={ACTION}
            disabled={pending}
            aria-label={expenses.deleteItem(template.name)}
            onClick={() => setMode("confirm-delete")}
          >
            {common.delete}
          </Button>
        </div>
      ) : null}

      {mode === "view" && blockedFromActivating ? (
        <p className="text-xs text-muted-foreground">{t.chooseCardToActivate}</p>
      ) : null}

      {mode === "edit" ? (
        <TemplateForm
          defaultValues={{
            kind: template.kind,
            name: template.name,
            amount: formatCopInput(template.amount),
            dueDay: template.dueDay === null ? "" : String(template.dueDay),
            cardId: template.cardId ?? "",
            tagId: template.tagId ?? "",
          }}
          canChooseKind={false}
          cardChoices={cardChoices}
          tags={tags}
          submitLabel={expenses.saveChanges}
          onCancel={toView}
          onSubmit={(draft) => {
            onUpdate(toTemplateUpdate(draft));
            toView();
          }}
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
          <span className="font-medium wrap-anywhere">{template.name}</span>
          {t.deleteAfter}
        </ConfirmPanel>
      ) : null}
    </li>
  );
}
