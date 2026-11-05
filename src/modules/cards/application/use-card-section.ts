import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CardsRepository } from "./cards-repository";
import { describeCardFailure } from "../domain/failures";
import type { CreditCardCreate, CreditCardUpdate } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import {
  CREDIT_CARDS_KEY,
  PERIOD_ITEMS_KEY,
  RECURRING_TEMPLATES_KEY,
} from "@/shared/api/query-keys";

// These wait for the server: a refused card has to keep its form open, and any change to a card shows
// in the per-card totals, while deleting one changes rows in other sections and in other months.
export function useCardSection(repository: CardsRepository, onSessionEnded: () => void) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);

  const query = useQuery({
    queryKey: CREDIT_CARDS_KEY,
    queryFn: () => repository.list(),
    retry: (count, error) => statusOf(error) !== 401 && count < 2,
  });

  const { error: queryError } = query;
  useEffect(() => {
    if (statusOf(queryError) === 401) {
      onSessionEnded();
    }
  }, [queryError, onSessionEnded]);

  const mutationOptions = {
    onMutate: () => setFailure(null),
    onError: (error: unknown) => {
      if (statusOf(error) === 401) {
        onSessionEnded();
        return;
      }
      setFailure(describeCardFailure(statusOf(error)));
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CREDIT_CARDS_KEY }),
        queryClient.invalidateQueries({ queryKey: PERIOD_ITEMS_KEY }),
      ]),
  };

  const create = useMutation({
    mutationFn: (card: CreditCardCreate) => repository.create(card),
    ...mutationOptions,
  });
  const update = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: CreditCardUpdate }) =>
      repository.update(id, changes),
    ...mutationOptions,
  });
  const remove = useMutation({
    mutationFn: (id: string) => repository.remove(id),
    ...mutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_TEMPLATES_KEY }),
  });

  return {
    cards: query.data ?? [],
    isLoading: query.isPending,
    loadFailed: query.isError && !query.data,
    refreshFailed: query.isError && Boolean(query.data),
    reload: () => void query.refetch(),
    failure,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    createCard: create.mutate,
    updateCard: (id: string, changes: CreditCardUpdate, callbacks: { onSuccess: () => void }) =>
      update.mutate({ id, changes }, callbacks),
    deleteCard: (id: string) => remove.mutate(id),
  };
}
