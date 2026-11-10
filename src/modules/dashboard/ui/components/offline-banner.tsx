import { describeDataAge } from "../../domain/data-age";
import { useMessages } from "@/shared/i18n/use-i18n";

interface OfflineBannerProps {
  isOffline: boolean;
  wasOffline: boolean;
  // Null when this page never got to load the month's numbers.
  dataAgeMs: number | null;
}

// Only the short notice is live: the visible text changes with the data's age and would be read out each minute.
export function OfflineBanner({ isOffline, wasOffline, dataAgeMs }: OfflineBannerProps) {
  const messages = useMessages();
  const t = messages.dashboard.offline;
  return (
    <>
      <p role="status" className="sr-only">
        {isOffline ? t.nowOffline : wasOffline ? t.backOnline : ""}
      </p>
      {isOffline ? (
        <p data-sticky-top className="sticky top-0 z-20 border-b border-signal bg-[#1c1503] px-4 py-2.5 text-sm sm:px-6">
          {t.offline}{" "}
          {dataAgeMs === null ? t.neverLoaded : t.lastUpdated(describeDataAge(dataAgeMs, messages))}{" "}
          {t.nothingCanChange}
        </p>
      ) : null}
    </>
  );
}
