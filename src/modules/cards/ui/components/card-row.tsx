"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { CardDraft } from "../../domain/card-forms";
import type { CreditCard, CreditCardUpdate } from "../../domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

const CardForm = dynamic(() => import("./card-form").then((module) => module.CardForm));

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "edit" | "confirm-delete";

interface CardRowProps {
  card: CreditCard;
  isUpdating: boolean;
  onUpdate: (changes: CreditCardUpdate, callbacks: { onSuccess: () => void }) => void;
  onDelete: () => void;
}

export function CardRow({ card, isUpdating, onUpdate, onDelete }: CardRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const { common, cards: t, expenses } = useMessages();
  const toView = () => setMode("view");

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <span className="font-medium wrap-anywhere">{card.name}</span>
      <span className="text-xs text-muted-foreground wrap-anywhere">
        {t.cardDays(card.issuer, card.statementDay, card.dueDay)}
      </span>

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button variant="link" className={ACTION} aria-label={t.editCard(card.name)} onClick={() => setMode("edit")}>
            {common.edit}
          </Button>
          <Button
            variant="link"
            className={ACTION}
            aria-label={t.deleteCard(card.name)}
            onClick={() => setMode("confirm-delete")}
          >
            {common.delete}
          </Button>
        </div>
      ) : null}

      {mode === "edit" ? (
        <CardForm
          defaultValues={{
            name: card.name,
            issuer: card.issuer,
            statementDay: String(card.statementDay),
            dueDay: String(card.dueDay),
          }}
          submitLabel={expenses.saveChanges}
          pending={isUpdating}
          onCancel={toView}
          onSubmit={(changes: CardDraft) => onUpdate(changes, { onSuccess: toView })}
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
          <span className="font-medium wrap-anywhere">{card.name}</span>
          {t.deleteAfter}
        </ConfirmPanel>
      ) : null}
    </li>
  );
}
