"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "cn";

import type { PlatformDraft } from "../../domain/platform-forms";
import type { Person, Platform } from "../../domain/types";
import { formatCOP, formatCopInput } from "@/modules/accounts/domain/money";
import type { CreditCard } from "@/modules/cards/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

const PlatformForm = dynamic(() => import("./platform-form").then((module) => module.PlatformForm));

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
  const { common, expenses, platforms: t } = useMessages();
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
          ? t.noMembers
          : t.perMember(formatCOP(platform.sharePerMember), platform.members.length)}
        {card ? ` · ${card.name}` : null}
      </p>

      {people.length > 0 ? (
        <div role="group" aria-label={t.membersOf(platform.name)} className="flex flex-wrap gap-2">
          {people.map((person) => {
            const member = isMember(person.id);
            return (
              <button
                key={person.id}
                type="button"
                aria-pressed={member}
                aria-label={t.sharesPlatform(person.name, platform.name)}
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
          <Button variant="link" className={ACTION} aria-label={expenses.editItem(platform.name)} onClick={() => setMode("edit")}>
            {common.edit}
          </Button>
          <Button
            variant="link"
            className={ACTION}
            aria-label={expenses.deleteItem(platform.name)}
            onClick={() => setMode("confirm-delete")}
          >
            {common.delete}
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
          submitLabel={expenses.saveChanges}
          pending={isSaving}
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
          {t.deletePlatformBefore}
          <span className="font-medium wrap-anywhere">{platform.name}</span>
          {t.deletePlatformAfter}
        </ConfirmPanel>
      ) : null}
    </li>
  );
}
