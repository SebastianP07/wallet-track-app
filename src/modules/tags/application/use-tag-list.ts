import { useQuery } from "@tanstack/react-query";

import type { TagsRepository } from "./tags-repository";
import { statusOf } from "@/shared/api/http-client";
import { TAGS_KEY } from "@/shared/api/query-keys";

export function useTagList(repository: TagsRepository) {
  const query = useQuery({
    queryKey: TAGS_KEY,
    queryFn: () => repository.list(),
    retry: (count, error) => statusOf(error) !== 401 && count < 2,
  });
  return {
    tags: query.data?.items ?? [],
    isLoading: query.isPending,
    loadFailed: query.isError && !query.data,
    refreshFailed: query.isError && Boolean(query.data),
    queryError: query.error,
    reload: () => void query.refetch(),
  };
}
