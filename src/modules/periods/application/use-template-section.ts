import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { TemplatesRepository } from "./periods-repository";
import { describeTemplateFailure } from "../domain/failures";
import {
  pendingTemplateId,
  withoutTemplate,
  withReplacedTemplate,
  withTemplate,
} from "../domain/optimistic-templates";
import type { Template, TemplateCreate, TemplateList, TemplateUpdate } from "../domain/types";
import { ApiError } from "@/shared/api/http-client";

const TEMPLATES_KEY = ["recurring-templates"];
const CARDS_KEY = ["credit-cards"];
const NO_CONNECTION_STATUS = 0;

const statusOf = (error: unknown) =>
  error instanceof ApiError ? error.status : NO_CONNECTION_STATUS;

interface OptimisticChange<Result> {
  next: TemplateList;
  // Each undoes only its own edit, so a failure never discards another edit still in flight.
  undo: (list: TemplateList) => TemplateList;
  confirm?: (list: TemplateList, result: Result) => TemplateList;
}

function useOptimisticMutation<Variables, Result>(options: {
  mutationFn: (variables: Variables) => Promise<Result>;
  change: (list: TemplateList, variables: Variables) => OptimisticChange<Result>;
  onStart: () => void;
  onFailure: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const update = (apply: (list: TemplateList) => TemplateList) =>
    queryClient.setQueryData<TemplateList>(TEMPLATES_KEY, (list) => list && apply(list));

  return useMutation({
    mutationKey: TEMPLATES_KEY,
    mutationFn: options.mutationFn,
    onMutate: async (variables) => {
      options.onStart();
      await queryClient.cancelQueries({ queryKey: TEMPLATES_KEY });
      const list = queryClient.getQueryData<TemplateList>(TEMPLATES_KEY);
      if (!list) {
        return null;
      }
      const change = options.change(list, variables);
      queryClient.setQueryData(TEMPLATES_KEY, change.next);
      return change;
    },
    onSuccess: (result, _variables, change) => {
      if (change?.confirm) {
        update((list) => change.confirm!(list, result));
      }
    },
    onError: (error, _variables, change) => {
      if (change) {
        update(change.undo);
      }
      options.onFailure(error);
    },
    onSettled: () =>
      queryClient.isMutating({ mutationKey: TEMPLATES_KEY }) === 1
        ? queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY })
        : undefined,
  });
}

export function useTemplateSection(repository: TemplatesRepository, onSessionEnded: () => void) {
  const [failure, setFailure] = useState<string | null>(null);

  const retry = (count: number, error: unknown) => statusOf(error) !== 401 && count < 2;
  const query = useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: () => repository.list(),
    retry,
  });
  const cardsQuery = useQuery({
    queryKey: CARDS_KEY,
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
    setFailure(describeTemplateFailure(statusOf(error)));
  };

  const create = useOptimisticMutation<TemplateCreate, Template>({
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
        tagId: null,
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

  const update = useOptimisticMutation<{ id: string; changes: TemplateUpdate }, Template>({
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

  const remove = useOptimisticMutation<string, void>({
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
    failure,
    reload: () => void query.refetch(),
    createTemplate: create.mutate,
    updateTemplate: (id: string, changes: TemplateUpdate) => update.mutate({ id, changes }),
    deleteTemplate: (id: string) => remove.mutate(id),
  };
}
