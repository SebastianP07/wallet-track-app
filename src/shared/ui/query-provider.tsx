"use client";

import { useState, type ReactNode } from "react";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DASHBOARD_KEY } from "@/shared/api/query-keys";

function createQueryClient() {
  const client: QueryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: true, refetchOnReconnect: true },
      // The default pauses a write made offline and sends it on reconnect. Writes are never queued: this fails it.
      mutations: { networkMode: "always" },
    },
    mutationCache: new MutationCache({
      // On failure too: a refused write may mean the data moved under this tab. Not awaited, so a write
      // never waits for the KPIs, and each later one restarts the refetch, so the last write's numbers win.
      onSettled: (_data, _error, _variables, _context, mutation) => {
        if (!mutation.meta?.keepsDashboard) {
          void client.invalidateQueries({ queryKey: DASHBOARD_KEY });
        }
      },
    }),
  });
  return client;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
