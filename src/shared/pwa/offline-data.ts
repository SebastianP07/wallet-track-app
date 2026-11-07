// public/sw.js and public/offline.js name this cache too.
const OFFLINE_DATA_CACHE = "wallet-track-offline-data";

// Never rejects: a sign-out must go ahead whatever the browser's storage is doing. The worker is told as well,
// so that a Dashboard response already on its way is not stored after this.
export async function clearOfflineData(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    registration?.active?.postMessage({ type: "clear-offline-data" });
    await caches.delete(OFFLINE_DATA_CACHE);
  } catch (error) {
    console.error("offline data could not be cleared", error);
  }
}
