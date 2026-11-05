"use client";

import { useState } from "react";

import type { CardDraft } from "../../domain/card-forms";
import type { CreditCard, CreditCardUpdate } from "../../domain/types";
import { CardForm } from "./card-form";
import { Button } from "@/shared/ui/button";

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
  const toView = () => setMode("view");

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <span className="font-medium wrap-anywhere">{card.name}</span>
      <span className="text-xs text-muted-foreground wrap-anywhere">
        {card.issuer} · Statement on day {card.statementDay} · Due on day {card.dueDay}
      </span>

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button variant="link" className={ACTION} aria-label={`Edit card ${card.name}`} onClick={() => setMode("edit")}>
            Edit
          </Button>
          <Button
            variant="link"
            className={ACTION}
            aria-label={`Delete card ${card.name}`}
            onClick={() => setMode("confirm-delete")}
          >
            Delete
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
          submitLabel="Save changes"
          pending={isUpdating}
          onCancel={toView}
          onSubmit={(changes: CardDraft) => onUpdate(changes, { onSuccess: toView })}
        />
      ) : null}

      {mode === "confirm-delete" ? (
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-sm">
            Delete <span className="font-medium wrap-anywhere">{card.name}</span> for good? Its active
            card charge templates become inactive, so months opened from now on won&apos;t get those
            charges. Charges already in a month stay, under Deleted card.
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
