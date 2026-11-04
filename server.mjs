import { createServer } from "node:http";
import { isIP } from "node:net";

import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOST ?? "0.0.0.0";

function normalizeAddress(address) {
  const trimmed = address?.trim() ?? "";
  return trimmed.toLowerCase().startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
}

// Only the last `trustedHops` entries of X-Forwarded-For were appended by our own reverse proxies;
// anything to their left was sent by the client and can say anything.
function resolveClientIp(request, trustedHops) {
  const peer = normalizeAddress(request.socket.remoteAddress);
  if (trustedHops === 0) {
    return peer;
  }
  const entries = (request.headers["x-forwarded-for"] ?? "").split(",");
  const appendedByEdge = normalizeAddress(entries.at(-trustedHops));
  return entries.length >= trustedHops && isIP(appendedByEdge) ? appendedByEdge : peer;
}

const server = createServer((request, response) => {
  // `next start` keeps a client-supplied X-Forwarded-For and Route Handlers cannot reach the socket,
  // so the real client can only be established here, before Next.js sees the request.
  request.headers["x-forwarded-for"] = resolveClientIp(request, trustedHops);
  handle(request, response);
});

const app = next({ dev, hostname, port, httpServer: server });
const handle = app.getRequestHandler();
await app.prepare();

// Read after prepare(), which is what loads the .env files.
const trustedHops = Number(process.env.TRUSTED_PROXY_HOPS ?? 0);
if (!Number.isInteger(trustedHops) || trustedHops < 0) {
  throw new Error("TRUSTED_PROXY_HOPS must be a non-negative integer");
}
// The BFF refuses to run without this, so plain `next start` cannot silently trust the client's header.
// It lives on globalThis because neither the environment nor a request can write there.
globalThis[Symbol.for("wallet-track.client-ip-resolved")] = true;

server.listen(port, hostname, () => {
  console.log(`> Listening on http://${hostname}:${port} (${dev ? "development" : "production"})`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
    server.closeIdleConnections();
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
