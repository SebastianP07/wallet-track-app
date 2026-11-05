"use client";

import { useState } from "react";

import {
  TEMPLATE_GROUP_TITLES,
  TEMPLATE_KINDS,
  templatesOf,
} from "../../domain/template-groups";
import type { CreditCard, Template, TemplateCreate, TemplateUpdate } from "../../domain/types";
import { TemplateForm } from "./template-form";
import { TemplateRow } from "./template-row";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

const NEW_TEMPLATE = { kind: "fixed", name: "", amount: "", dueDay: "", cardId: "" } as const;

interface TemplateSectionProps {
  templates: Template[];
  cards: CreditCard[];
  cardsAreLoading: boolean;
  cardsLoadFailed: boolean;
  reloadCards: () => void;
  isLoading: boolean;
  loadFailed: boolean;
  refreshFailed: boolean;
  isCreating: boolean;
  failure: string | null;
  reload: () => void;
  createTemplate: (template: TemplateCreate, callbacks: { onSuccess: () => void }) => void;
  updateTemplate: (id: string, changes: TemplateUpdate) => void;
  deleteTemplate: (id: string) => void;
}

export function TemplateSection({
  templates,
  cards,
  cardsAreLoading,
  cardsLoadFailed,
  reloadCards,
  isLoading,
  loadFailed,
  refreshFailed,
  isCreating,
  failure,
  reload,
  createTemplate,
  updateTemplate,
  deleteTemplate,
}: TemplateSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const cardChoices = {
    cards,
    isLoading: cardsAreLoading,
    loadFailed: cardsLoadFailed,
    reload: reloadCards,
  };

  if (isLoading) {
    return (
      <div role="status" className="ledger-rows flex h-36 items-end">
        <p className="pb-2 font-mono text-xs text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message="The templates could not be loaded." />
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
          Showing the last templates received; they could not be refreshed.
        </p>
      ) : null}

      {templates.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-muted-foreground">
          No templates yet. Add what repeats every month.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-3">
          {TEMPLATE_KINDS.map((kind) => {
            const rows = templatesOf(templates, kind);
            return (
              <div key={kind} className="flex min-w-0 flex-col gap-2">
                <h4 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {TEMPLATE_GROUP_TITLES[kind]}
                </h4>
                {rows.length === 0 ? (
                  <p className="border-t border-rule py-3 text-sm text-muted-foreground">
                    None yet.
                  </p>
                ) : (
                  <ul className="flex flex-col">
                    {rows.map((template) => (
                      <TemplateRow
                        key={template.id}
                        template={template}
                        cardChoices={cardChoices}
                        onUpdate={(changes) => updateTemplate(template.id, changes)}
                        onDelete={() => deleteTemplate(template.id)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAdding ? (
        <div className="border-t border-rule pt-3 lg:max-w-xl">
          <TemplateForm
            defaultValues={NEW_TEMPLATE}
            canChooseKind
            cardChoices={cardChoices}
            submitLabel="Save"
            pending={isCreating}
            onCancel={() => setIsAdding(false)}
            onSubmit={(template) =>
              createTemplate(template, { onSuccess: () => setIsAdding(false) })
            }
          />
        </div>
      ) : (
        <Button variant="outline" className="mt-auto lg:self-start" onClick={() => setIsAdding(true)}>
          Add template
        </Button>
      )}
    </div>
  );
}
