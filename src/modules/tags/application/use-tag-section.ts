import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TagsRepository } from "./tags-repository";
import { useTagList } from "./use-tag-list";
import { describeTagFailure } from "../domain/failures";
import type { TagCreate, TagUpdate } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import { PERIOD_ITEMS_KEY, RECURRING_TEMPLATES_KEY, TAGS_KEY } from "@/shared/api/query-keys";

// These wait for the server: a taken name has to keep the form open with its message, and deleting
// a tag changes rows in other sections.
export function useTagSection(repository: TagsRepository, onSessionEnded: () => void) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);
  const { queryError, ...list } = useTagList(repository);

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
      setFailure(describeTagFailure(statusOf(error)));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TAGS_KEY }),
  };

  const create = useMutation({
    mutationFn: (tag: TagCreate) => repository.create(tag),
    ...mutationOptions,
  });
  const update = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: TagUpdate }) => repository.update(id, changes),
    ...mutationOptions,
  });
  const remove = useMutation({
    mutationFn: (id: string) => repository.remove(id),
    ...mutationOptions,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PERIOD_ITEMS_KEY }),
        queryClient.invalidateQueries({ queryKey: RECURRING_TEMPLATES_KEY }),
      ]),
  });

  return {
    ...list,
    failure,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    createTag: create.mutate,
    updateTag: (id: string, changes: TagUpdate, callbacks: { onSuccess: () => void }) =>
      update.mutate({ id, changes }, callbacks),
    deleteTag: (id: string) => remove.mutate(id),
  };
}
