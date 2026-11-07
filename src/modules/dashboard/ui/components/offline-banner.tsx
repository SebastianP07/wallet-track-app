import { describeDataAge } from "../../domain/data-age";

interface OfflineBannerProps {
  isOffline: boolean;
  wasOffline: boolean;
  // Null when this page never got to load the month's numbers.
  dataAgeMs: number | null;
}

// Only the short notice is live: the visible text changes with the data's age and would be read out each minute.
export function OfflineBanner({ isOffline, wasOffline, dataAgeMs }: OfflineBannerProps) {
  return (
    <>
      <p role="status" className="sr-only">
        {isOffline ? "You're offline. Nothing can be changed until you reconnect." : wasOffline ? "You're back online." : ""}
      </p>
      {isOffline ? (
        <p className="sticky top-0 z-20 border-b border-signal bg-[#1c1503] px-4 py-2.5 text-sm sm:px-6">
          You&apos;re offline.{" "}
          {dataAgeMs === null
            ? "This month's numbers never loaded on this page."
            : `These numbers were last updated ${describeDataAge(dataAgeMs)} and may be out of date.`}{" "}
          Nothing can be changed until you reconnect.
        </p>
      ) : null}
    </>
  );
}
