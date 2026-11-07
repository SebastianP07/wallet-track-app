// Holds only the offline fallback and the last Dashboard's JSON. The app's own pages and assets always come
// from the network, so a new deploy can never be stranded behind this worker.

// The registration's URL carries a hash of the shell's files (next.config.ts), so any change to them installs a
// new worker. public/offline.js names the data cache and key too.
const VERSION = new URL(self.location.href).searchParams.get("v") ?? "unversioned";
const SHELL_CACHE_PREFIX = "wallet-track-shell-";
const SHELL_CACHE = `${SHELL_CACHE_PREFIX}${VERSION}`;
const DATA_CACHE = "wallet-track-offline-data";
const DATA_KEY = "/offline-data/dashboard";
const SAVED_AT_HEADER = "X-Saved-At";
const DASHBOARD_PATH = "/api/v1/dashboard";
const OFFLINE_PAGE = "/offline.html";
const SHELL_FILES = [
  OFFLINE_PAGE,
  "/offline.js",
  "/offline.css",
  "/manifest.webmanifest",
  "/icons/icon-32.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// A clear also has to beat a Dashboard response already on its way: anything fetched before it is not stored.
let generation = 0;

function clearData() {
  generation += 1;
  return caches.delete(DATA_CACHE);
}

// Only the body and the moment: no header of the API's response reaches the disk.
async function saveDashboard(response, startedIn) {
  const body = await response.text();
  const cache = await caches.open(DATA_CACHE);
  if (startedIn !== generation) {
    return;
  }
  await cache.put(
    DATA_KEY,
    new Response(body, {
      headers: { "Content-Type": "application/json", [SAVED_AT_HEADER]: String(Date.now()) },
    }),
  );
}

// Online pages always get the network's answer; only the offline fallback reads what is stored.
async function fetchDashboard(event) {
  const startedIn = generation;
  const response = await fetch(event.request);
  if (response.status === 401) {
    await clearData();
  } else if (response.ok) {
    event.waitUntil(saveDashboard(response.clone(), startedIn));
  }
  return response;
}

async function fetchPage(request) {
  try {
    return await fetch(request);
  } catch {
    return caches.match(OFFLINE_PAGE, { cacheName: SHELL_CACHE });
  }
}

async function fetchShellFile(request) {
  try {
    return await fetch(request);
  } catch {
    const stored = await caches.match(new URL(request.url).pathname, { cacheName: SHELL_CACHE });
    return stored ?? Response.error();
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(SHELL_CACHE_PREFIX) && name !== SHELL_CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "clear-offline-data") {
    event.waitUntil(clearData());
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }
  if (url.pathname === DASHBOARD_PATH) {
    event.respondWith(fetchDashboard(event));
  } else if (request.mode === "navigate") {
    event.respondWith(fetchPage(request));
  } else if (SHELL_FILES.includes(url.pathname)) {
    event.respondWith(fetchShellFile(request));
  }
});
