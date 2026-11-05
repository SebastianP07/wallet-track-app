"use client";

import { useState } from "react";
import { cn } from "cn";

import type { PlatformDraft } from "../../domain/platform-forms";
import type { Person, Platform } from "../../domain/types";
import { PlatformForm } from "./platform-form";
import { formatCOP, formatCopInput } from "@/modules/accounts/domain/money";
import type { CreditCard } from "@/modules/cards/domain/types";
import { Button } from "@/shared/ui/button";

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "edit" | "confirm-delete";

interface PlatformRowProps {
  platform: Platform;
  people: Person[];
  cards: CreditCard[];
  isSaving: boolean;
  isChangingMembers: boolean;
  onUpdate: (changes: PlatformDraft, callbacks: { onSuccess: () => void }) => void;
  onDelete: () => void;
  onSetMember: (personId: string, member: boolean) => void;
}

export function PlatformRow({
  platform,
  people,
  cards,
  isSaving,
  isChangingMembers,
  onUpdate,
  onDelete,
  onSetMember,
}: PlatformRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const toView = () => setMode("view");
  const card = cards.find(({ id }) => id === platform.cardId);
  const isMember = (personId: string) => platform.members.some((member) => member.personId === personId);

  return (
    <li className="flex flex-col gap-2 border-t border-rule py-3">
      <div className="flex items-start justify-between gap-3">
        <span className="font-medium wrap-anywhere">{platform.name}</span>
        <span className="shrink-0 text-right font-mono text-sm leading-6 whitespace-nowrap">
          {formatCOP(platform.monthlyCost)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground wrap-anywhere">
        {platform.members.length === 0
          ? "No members yet"
          : `${formatCOP(platform.sharePerMember)} per member · ${platform.members.length} ${
              platform.members.length === 1 ? "member" : "members"
            }`}
        {card ? ` · ${card.name}` : null}
      </p>

      {people.length > 0 ? (
        <div role="group" aria-label={`Members of ${platform.name}`} className="flex flex-wrap gap-2">
          {people.map((person) => {
            const member = isMember(person.id);
            return (
              <button
                key={person.id}
                type="button"
                aria-pressed={member}
                aria-label={
                  member
                    ? `Remove ${person.name} from ${platform.name}`
                    : `Add ${person.name} to ${platform.name}`
                }
                disabled={isChangingMembers}
                onClick={() => onSetMember(person.id, !member)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-md border px-3 text-sm wrap-anywhere focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
                  member
                    ? "border-primary bg-primary/15 font-medium text-foreground"
                    : "border-input text-muted-foreground hover:bg-accent",
                )}
              >
                {person.name}
              </button>
            );
          })}
        </div>
      ) : null}

      {mode === "view" ? (
        <div className="flex flex-wrap items-center">
          <Button variant="link" className={ACTION} aria-label={`Edit ${platform.name}`} onClick={() => setMode("edit")}>
            Edit
          </Button>
          <Button
            variant="link"
            className={ACTION}
            aria-label={`Delete ${platform.name}`}
            onClick={() => setMode("confirm-delete")}
          >
            Delete
          </Button>
        </div>
      ) : null}

      {mode === "edit" ? (
        <PlatformForm
          defaultValues={{
            name: platform.name,
            monthlyCost: formatCopInput(platform.monthlyCost),
            cardId: platform.cardId ?? "",
          }}
          cards={cards}
          submitLabel="Save changes"
          pending={isSaving}
          onCancel={toView}
          onSubmit={(changes) => onUpdate(changes, { onSuccess: toView })}
        />
      ) : null}

      {mode === "confirm-delete" ? (
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-sm">
            Delete <span className="font-medium wrap-anywhere">{platform.name}</span> for good? Months
            opened from now on won&apos;t count it. Income items already in a month keep their amount.
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
