import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { TemplatesRepository } from "./periods-repository";
import { describeTemplateFailure } from "../domain/failures";
import {
  pendingTemplateId,
  withoutTemplate,
  withReplacedTemplate,
  withTemplate,
} from "../domain/optimistic-templates";
import type { Template, TemplateCreate, TemplateList, TemplateUpdate } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import { useMessages, type Translatable } from "@/shared/i18n/use-i18n";
import { CREDIT_CARDS_KEY, RECURRING_TEMPLATES_KEY } from "@/shared/api/query-keys";
import { useOptimisticMutation } from "@/shared/query/use-optimistic-mutation";

const TEMPLATES_KEY = RECURRING_TEMPLATES_KEY;

export function useTemplateSection(repository: TemplatesRepository, onSessionEnded: () => void) {
  const messages = useMessages();
  const [failure, setFailure] = useState<Translatable | null>(null);

  const retry = (count: number, error: unknown) => statusOf(error) !== 401 && count < 2;
  const query = useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: () => repository.list(),
    retry,
  });
  const cardsQuery = useQuery({
    queryKey: CREDIT_CARDS_KEY,
    queryFn: () => repository.listCards(),
    retry,
  });

  const { error: queryError } = query;
  useEffect(() => {
    if (statusOf(queryError) === 401) {
      onSessionEnded();
    }
  }, [queryError, onSessionEnded]);

  const onStart = () => setFailure(null);
  const onFailure = (error: unknown) => {
    if (statusOf(error) === 401) {
      onSessionEnded();
      return;
    }
    const status = statusOf(error);
    setFailure(() => (current: typeof messages) => describeTemplateFailure(status, current));
  };

  const create = useOptimisticMutation<TemplateList, TemplateCreate, Template>({
    queryKey: TEMPLATES_KEY,
    mutationFn: (template) => repository.create(template),
    change: (list, template) => {
      const now = new Date().toISOString();
      const pending: Template = {
        id: pendingTemplateId(),
        kind: template.kind,
        name: template.name,
        amount: template.amount,
        dueDay: template.kind === "fixed" ? template.dueDay : null,
        cardId: template.kind === "card_charge" ? template.cardId : null,
        tagId: template.tagId ?? null,
        active: template.active,
        createdAt: now,
        updatedAt: now,
      };
      return {
        next: withTemplate(list, pending),
        undo: (current) => withoutTemplate(current, pending.id),
        confirm: (current, created) => withReplacedTemplate(current, pending.id, created),
      };
    },
    onStart,
    onFailure,
  });

  const update = useOptimisticMutation<TemplateList, { id: string; changes: TemplateUpdate }, Template>({
    queryKey: TEMPLATES_KEY,
    mutationFn: ({ id, changes }) => repository.update(id, changes),
    change: (list, { id, changes }) => {
      const previous = list.items.find((template) => template.id === id);
      if (!previous) {
        return { next: list, undo: (current) => current };
      }
      return {
        next: withReplacedTemplate(list, id, { ...previous, ...changes }),
        undo: (current) => withReplacedTemplate(current, id, previous),
        confirm: (current, updated) => withReplacedTemplate(current, id, updated),
      };
    },
    onStart,
    onFailure,
  });

  const remove = useOptimisticMutation<TemplateList, string, void>({
    queryKey: TEMPLATES_KEY,
    mutationFn: (id) => repository.remove(id),
    change: (list, id) => {
      const index = list.items.findIndex((template) => template.id === id);
      const previous = list.items[index];
      if (!previous) {
        return { next: list, undo: (current) => current };
      }
      return {
        next: withoutTemplate(list, id),
        undo: (current) => withTemplate(current, previous, Math.min(index, current.items.length)),
      };
    },
    onStart,
    onFailure,
  });

  const list = query.data;
  return {
    templates: list?.items ?? [],
    cards: cardsQuery.data ?? [],
    cardsAreLoading: cardsQuery.isPending,
    cardsLoadFailed: cardsQuery.isError && !cardsQuery.data,
    reloadCards: () => void cardsQuery.refetch(),
    isLoading: query.isPending,
    loadFailed: query.isError && !list,
    refreshFailed: query.isError && Boolean(list),
    isCreating: create.isPending,
    failure: failure?.(messages) ?? null,
    reload: () => void query.refetch(),
    createTemplate: create.mutate,
    updateTemplate: (id: string, changes: TemplateUpdate) => update.mutate({ id, changes }),
    deleteTemplate: (id: string) => remove.mutate(id),
  };
}
