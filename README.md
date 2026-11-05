# Wallet Track App

Next.js frontend for Wallet Track, a private personal finance app. The cross-repo plan and decisions
live in `PLAN.md`, next to this repository's checkout.

## Quick path

```sh
pnpm install
cp .env.example .env.local
pnpm dev
curl localhost:3000/healthz
```

## Run it against the API

The BFF and the API must agree on three things, or logging in fails. Start the API from `wallet-track-core-app`
with these values, then run `pnpm dev` here and open <http://localhost:3000>, not `127.0.0.1`:

```sh
make dev INSECURE_DEV_COOKIES=true TRUSTED_PROXIES=127.0.0.1/32,::1/128 ALLOWED_ORIGINS=http://localhost:3000
```

| Setting | Why |
|---|---|
| `INSECURE_DEV_COOKIES=true` (API) | Plain HTTP cannot hold `__Host-` cookies. The session becomes `dev-session` |
| `TRUSTED_PROXIES` (API) | Must cover the BFF's address, or the API ignores `X-Forwarded-For` and every client shares one password lockout and one rate limit |
| `ALLOWED_ORIGINS` (API) and `APP_ORIGIN` (here) | Must hold the same origin. The BFF forwards `Origin`, and the API answers 403 to one it does not list |

To create the owner and log in the first time, see the backend README.

## BFF

`src/app/api/[...path]/route.ts` forwards `/api/v1/*` to `API_INTERNAL_URL`.

| Concern | Behavior |
|---|---|
| `Origin` | A mutating request must carry exactly `APP_ORIGIN`, otherwise 403. A missing `Origin` is rejected too: browsers always send it on these requests |
| Request headers | Allowlist only: `Accept`, `Content-Type`, `Cookie`, `Origin`, `User-Agent`, `X-CSRF-Token`, `X-Forwarded-For` |
| `X-Forwarded-For` | Built by `server.mjs` from the client's real address. Whatever the client sent is overwritten |
| Responses | Status, body and headers pass through, including each `Set-Cookie` separately and `Retry-After`. Always `Cache-Control: no-store` |
| API unreachable | `application/problem+json` 502. The log line holds only the method and an error code; nothing logs bodies, cookies or tokens |

### Why a custom server

`next start` keeps a client-supplied `X-Forwarded-For`, and a Route Handler cannot read the socket. Nothing inside
Next.js can therefore tell the real client from a forged header, and a forged header would let anyone choose
which lockout bucket they land in. `server.mjs` is the small Next.js custom server that sets the header before
Next.js sees the request. `pnpm dev` and `pnpm start` both use it. The BFF answers 500 if it is started any other
way, such as plain `next start`, and Next.js's `standalone` output cannot be used. It knows through a marker
`server.mjs` sets on `globalThis`, which neither the environment nor a request can set.

Behind reverse proxies, set `TRUSTED_PROXY_HOPS` to how many there are. The client is then that entry counted
from the right of the incoming `X-Forwarded-For`, and everything further left is discarded.

## Security headers

`src/proxy.ts` sets a per-request nonce-based CSP on every page, and `next.config.ts` adds HSTS,
`X-Content-Type-Options` and `Referrer-Policy` to every response. Three things follow from the nonce:

- Every page renders on demand, which the root layout forces. A prerendered page would have no nonce.
- Never use a server-rendered `style` attribute or inline `<style>`; production blocks them. That is why the app
  has its own `not-found.tsx` and `error.tsx`: Next.js's defaults use inline styles.
- Development relaxes the policy with `'unsafe-eval'`, `'unsafe-inline'` styles and the HMR WebSocket.

`upgrade-insecure-requests` is added only when `APP_ORIGIN` is `https://`.

## Session handling

`src/proxy.ts` redirects a request with no session cookie to `/login`. A cookie's presence proves nothing, so pages
then call `GET /me` on the server: a forged, expired or password-only session goes to `/login`. If the API cannot
answer, the Dashboard says so rather than logging the user out. Open dashboards revalidate when they regain
visibility, so logging out everywhere reaches other tabs.

The login steps live in React state only. Reloading during the second factor returns to the password step.
Recovery codes stay in memory until acknowledged, and leaving the page first triggers the browser's warning.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Run the dev server, through `server.mjs` |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production build, through `server.mjs` |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run `tsc --noEmit` |
| `pnpm test` | Run Vitest and Testing Library tests |
| `pnpm contract:refresh` | Copy `contracts/openapi.yaml` from the sibling `wallet-track-core-app` checkout |
| `pnpm contract:types` | Generate `src/shared/api/openapi.ts` from the vendored contract |
| `pnpm contract:check` | Fail if the generated types are stale, or the copy differs from a sibling checkout |

## Requirements

| Tool | Version | Source |
|---|---|---|
| Node | see `.nvmrc` | `nvm use` |
| pnpm | see `packageManager` in `package.json` | Selected automatically by pnpm or Corepack |

TypeScript stays on 6.x: `typescript-eslint`, which `eslint-config-next` requires, refuses to run on
TypeScript 7. `openapi-typescript` 7 declares a peer of TypeScript 5, so pnpm warns about it; generation works
on 6.x.

## Configuration

Read when the server starts, from the environment or `.env.local`. `.env.example` lists them.

| Variable | Default | Purpose |
|---|---|---|
| `API_INTERNAL_URL` | `http://127.0.0.1:8080`; none in production | Where the server reaches the Go API |
| `APP_ORIGIN` | `http://localhost:3000`; none in production | The exact origin the browser uses. The BFF answers 500 without it |
| `TRUSTED_PROXY_HOPS` | `0` | Reverse proxies that really append to `X-Forwarded-For`. Defaults to `0`, which uses the TCP peer as the client. A value above the real hop count trusts client-supplied entries |
| `PORT`, `HOST` | `3000`, `0.0.0.0` | Process environment only, not `.env.local` |

## Layout

| Path | Contents |
|---|---|
| `server.mjs` | Custom server: establishes the client address, then hands over to Next.js |
| `src/proxy.ts` | CSP nonce and the redirect of requests with no session cookie |
| `src/app` | Next routes only: thin pages, the `/api` BFF route, `/healthz`, global theme |
| `src/modules/<module>` | `domain`, `application`, `infrastructure`, `ui/containers`, `ui/components`. Today: `accounts`, `auth`, `cards`, `dashboard`, `expenses`, `income`, `overdue`, `periods`, `platforms`, `tags` |
| `src/shared/ui` | Design system: `card` from shadcn/ui (`pnpm dlx shadcn add <name>`), the rest written by hand so they need no Radix |
| `src/shared/api` | `openapi.ts`, generated from the contract and never edited by hand, and the browser HTTP client with CSRF handling |
| `src/shared/query` | The optimistic mutation hook and row helpers, on TanStack Query |
| `src/shared/validation` | Where schemas import zod from, set to `jitless` so it never probes `new Function` under the CSP |
| `src/shared/bff` | The server-side proxy to the API |
| `src/shared/security` | The CSP |
| `contracts` | Vendored `openapi.yaml`; never edit by hand |

The theme is dark only, on near-black `#0a0a0a`, with marigold as the one accent. There is no light palette:
`src/app/globals.css` defines the tokens once, and `<html class="dark">` keeps the `dark:` variants of shadcn
components active. Fonts are self-hosted from `@fontsource-variable` packages, so no page contacts a font CDN.

MSW is not installed: the real API is available, so Phase 3 was built and checked against it.

## HTTP contract

`wallet-track-core-app` owns `contracts/openapi.yaml`. To pick up a change, with that repository checked out
next to this one:

```sh
pnpm contract:refresh
pnpm contract:types
```

Commit both results. CI runs `pnpm contract:check`.
