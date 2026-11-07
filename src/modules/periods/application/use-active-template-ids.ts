import { useQuery } from "@tanstack/react-query";

import type { TemplatesRepository } from "./periods-repository";
import { statusOf } from "@/shared/api/http-client";
import { RECURRING_TEMPLATES_KEY } from "@/shared/api/query-keys";

const NONE = new Set<string>();

// Which templates still repeat, from the same cached list the templates section shows, so a row can offer to
// stop repeating only while its template does. Until the list arrives, no row offers it.
export function useActiveTemplateIds(repository: TemplatesRepository): ReadonlySet<string> {
  const { data } = useQuery({
    queryKey: RECURRING_TEMPLATES_KEY,
    queryFn: () => repository.list(),
    retry: (count, error) => statusOf(error) !== 401 && count < 2,
  });
  if (!data) {
    return NONE;
  }
  return new Set(data.items.filter((template) => template.active).map((template) => template.id));
}
