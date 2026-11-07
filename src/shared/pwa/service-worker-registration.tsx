"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { DASHBOARD_KEY } from "@/shared/api/query-keys";

export function ServiceWorkerRegistration() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }
    // A page that loaded before its first worker took over asked for the Dashboard with nobody there to save it.
    const onControllerChange = () => void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker
      .register(`/sw.js?v=${process.env.NEXT_PUBLIC_OFFLINE_SHELL_VERSION}`, { scope: "/", updateViaCache: "none" })
      .catch((error: unknown) => {
        console.error("the service worker could not be registered", error);
      });
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, [queryClient]);

  return null;
}
