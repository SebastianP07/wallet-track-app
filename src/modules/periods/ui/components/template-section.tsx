"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { TEMPLATE_KINDS, templatesOf } from "../../domain/template-groups";
import type { CreditCard, Template, TemplateCreate, TemplateUpdate } from "../../domain/types";
import { TemplateRow } from "./template-row";
import type { Tag } from "@/modules/tags/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

const TemplateForm = dynamic(() => import("./template-form").then((module) => module.TemplateForm));

const NEW_TEMPLATE = { kind: "fixed", name: "", amount: "", dueDay: "", cardId: "", tagId: "" } as const;

interface TemplateSectionProps {
  templates: Template[];
  tags: Tag[];
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
  tags,
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
  const { common, periods } = useMessages();
  const t = periods.templates;
  const cardChoices = {
    cards,
    isLoading: cardsAreLoading,
    loadFailed: cardsLoadFailed,
    reload: reloadCards,
  };

  if (isLoading) {
    return (
      <div role="status" className="ledger-rows flex h-36 items-end">
        <p className="pb-2 font-mono text-xs text-muted-foreground">{common.loading}</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={t.loadFailed} />
        <Button variant="outline" onClick={reload}>
          {common.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <FormAlert message={failure} />
      {refreshFailed ? (
        <p className="text-sm text-muted-foreground">
          {t.refreshFailed}
        </p>
      ) : null}

      {templates.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-3">
          {TEMPLATE_KINDS.map((kind) => {
            const rows = templatesOf(templates, kind);
            return (
              <div key={kind} className="flex min-w-0 flex-col gap-2">
                <h4 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {t.groups[kind]}
                </h4>
                {rows.length === 0 ? (
                  <p className="border-t border-rule py-3 text-sm text-muted-foreground">
                    {t.noneYet}
                  </p>
                ) : (
                  <ul className="flex flex-col">
                    {rows.map((template) => (
                      <TemplateRow
                        key={template.id}
                        template={template}
                        cardChoices={cardChoices}
                        tags={tags}
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
            tags={tags}
            submitLabel={common.save}
            pending={isCreating}
            onCancel={() => setIsAdding(false)}
            onSubmit={(template) =>
              createTemplate(template, { onSuccess: () => setIsAdding(false) })
            }
          />
        </div>
      ) : (
        <Button variant="outline" className="mt-auto lg:self-start" onClick={() => setIsAdding(true)}>
          {t.add}
        </Button>
      )}
    </div>
  );
}
