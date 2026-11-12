"use client";

import { useDataRefresh } from "../../application/use-data-refresh";
import { RefreshAction } from "../components/refresh-action";

export function RefreshContainer() {
  const { isRefreshing, refresh } = useDataRefresh();
  return <RefreshAction isRefreshing={isRefreshing} onRefresh={refresh} />;
}
