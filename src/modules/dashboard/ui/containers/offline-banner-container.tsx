"use client";

import { useEffect, useState } from "react";

import { useDashboard } from "../../application/use-dashboard";
import { httpDashboardRepository } from "../../infrastructure/http-dashboard-repository";
import { OfflineBanner } from "../components/offline-banner";

const AGE_REFRESH_MS = 30_000;

interface OfflineBannerContainerProps {
  isOffline: boolean;
  period: string;
  onSessionEnded: () => void;
}

export function OfflineBannerContainer({ isOffline, period, onSessionEnded }: OfflineBannerContainerProps) {
  const { updatedAt } = useDashboard(httpDashboardRepository, period, onSessionEnded);
  const [wasOffline, setWasOffline] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!isOffline) {
      return;
    }
    const refresh = () => setNow(Date.now());
    const timer = setInterval(refresh, AGE_REFRESH_MS);
    const firstRefresh = setTimeout(refresh);
    return () => {
      clearInterval(timer);
      clearTimeout(firstRefresh);
      setWasOffline(true);
    };
  }, [isOffline]);

  return (
    <OfflineBanner
      isOffline={isOffline}
      wasOffline={wasOffline}
      dataAgeMs={updatedAt > 0 ? Math.max(now - updatedAt, 0) : null}
    />
  );
}
