"use client";

import { useState } from "react";

import type { CardDraft } from "../../domain/card-forms";
import type { CreditCard, CreditCardUpdate } from "../../domain/types";
import { CardForm } from "./card-form";
import { CardRow } from "./card-row";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

const NEW_CARD = { name: "", issuer: "", statementDay: "", dueDay: "" };

interface CardManagerProps {
  cards: CreditCard[];
  isLoading: boolean;
  loadFailed: boolean;
  refreshFailed: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  failure: string | null;
  reload: () => void;
  createCard: (card: CardDraft, callbacks: { onSuccess: () => void }) => void;
  updateCard: (id: string, changes: CreditCardUpdate, callbacks: { onSuccess: () => void }) => void;
  deleteCard: (id: string) => void;
}

// Cards belong to no month, so they stay manageable whatever state the selected month is in.
export function CardManager({
  cards,
  isLoading,
  loadFailed,
  refreshFailed,
  isCreating,
  isUpdating,
  failure,
  reload,
  createCard,
  updateCard,
  deleteCard,
}: CardManagerProps) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3 border-t border-rule pt-4">
      <h4 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Cards</h4>
      {isLoading ? (
        <p role="status" className="font-mono text-xs text-muted-foreground">
          Loading…
        </p>
      ) : loadFailed ? (
        <div className="flex flex-col items-start gap-3">
          <FormAlert message="The cards could not be loaded." />
          <Button variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <FormAlert message={failure} />
          {refreshFailed ? (
            <p className="text-sm text-muted-foreground">
              Showing the last cards received; they could not be refreshed.
            </p>
          ) : null}

          {cards.length === 0 ? (
            <p className="border-t border-rule py-3 text-sm text-muted-foreground">
              No cards yet. Add one to start tracking its charges.
            </p>
          ) : (
            <ul className="flex flex-col">
              {cards.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  isUpdating={isUpdating}
                  onUpdate={(changes, callbacks) => updateCard(card.id, changes, callbacks)}
                  onDelete={() => deleteCard(card.id)}
                />
              ))}
            </ul>
          )}

          {isAdding ? (
            <div className="border-t border-rule pt-3">
              <CardForm
                defaultValues={NEW_CARD}
                submitLabel="Save"
                pending={isCreating}
                onCancel={() => setIsAdding(false)}
                onSubmit={(card) => createCard(card, { onSuccess: () => setIsAdding(false) })}
              />
            </div>
          ) : (
            <Button variant="outline" className="lg:self-start" onClick={() => setIsAdding(true)}>
              Add card
            </Button>
          )}
        </>
      )}
    </div>
  );
}
