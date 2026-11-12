import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { statusOf } from "@/shared/api/http-client";
import { notify } from "@/shared/feedback/toast-store";
import { useMessages } from "@/shared/i18n/use-i18n";

// A month with no period answers 404 and an ended session 401: the sections handle both, so neither is a failed refresh.
const EXPECTED_STATUSES = [401, 404];

// Asks the server again for everything on the page. The cache stays in place, so nothing on screen empties while
// the answers arrive; what is not shown right now is marked stale and refetched once it is.
export function useDataRefresh() {
  const queryClient = useQueryClient();
  const messages = useMessages();
  const isFetching = useIsFetching() > 0;

  const refresh = async () => {
    const startedAt = Date.now();
    await queryClient.invalidateQueries();
    const failed = queryClient
      .getQueryCache()
      .findAll({ type: "active" })
      .some(
        ({ state }) =>
          state.status === "error" &&
          state.errorUpdatedAt >= startedAt &&
          !EXPECTED_STATUSES.includes(statusOf(state.error)),
      );
    const t = messages.dashboard.refresh;
    if (failed) {
      notify.error(t.failed);
    } else {
      notify.success(t.done);
    }
  };

  return { isRefreshing: isFetching, refresh: () => void refresh() };
}
