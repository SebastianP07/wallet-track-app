# Changelog

## 0.5.0 — 2026-11-04 — Auth frontend

- Added the Login route: password, TOTP, recovery code, first-time MFA enrollment with a locally drawn QR code and
  the secret as text, and one-time recovery codes that must be acknowledged. Driven by the contract's `nextStep`,
  with generic failure text and `Retry-After` shown as a wait.
- Added the Dashboard shell: month switcher, a responsive grid with an empty placeholder per T4 section, logout
  and logout-all.
- Added the BFF at `/api/[...path]`: `Origin` check, allowlisted request headers, faithful responses including
  several `Set-Cookie`, no caching, and a problem+json 502 when the API is unreachable.
- Added `server.mjs`, a custom server, because `next start` keeps a client-supplied `X-Forwarded-For` and a Route
  Handler cannot read the socket. `pnpm dev` and `pnpm start` now run through it. It sets a marker on `globalThis`
  and the BFF answers 500 without it, so no environment variable can make plain `next start` trust the header.
- Added `src/proxy.ts` with a nonce-based CSP, a redirect for requests with no session cookie, and server-side
  `GET /me` verification in the pages. It skips only `/api`, `/healthz` and what lies under them, so `/apiary` is
  covered. Added HSTS, `X-Content-Type-Options` and `Referrer-Policy`.
- Added themed 404 and error pages, because the CSP blocks the inline styles of Next.js's defaults.
- Added TanStack Query, react-hook-form, zod, qrcode.react, lucide-react and self-hosted fonts. No MSW, no Recharts
  and no Playwright. Per T7, no new automated tests; `page.test.tsx` follows the page's new shape.

## 0.2.0 — 2026-11-04 — Contract and schema

- Added the vendored `contracts/openapi.yaml` and `pnpm contract:refresh`, which copies it from the sibling
  backend checkout.
- Added `openapi-typescript` and `pnpm contract:types`, generating `src/shared/api/openapi.ts`. Nothing
  consumes the types yet.
- Added `pnpm contract:check` to spot stale types, and a CI step that runs it.
- Refreshed the contract and types: `startMfaEnrollment` takes a one-time enrollment secret, card charges never
  become overdue, deleting a card deactivates its card charge templates, and month counts stop at 120.

## 0.1.0 — 2026-11-04 — Foundations

- Added the Next.js App Router skeleton with TypeScript strict, a base layout and a minimal page.
- Added Tailwind and shadcn/ui, dark only on near-black `#0a0a0a`.
- Added the `/healthz` route handler.
- Added ESLint, typecheck and Vitest with Testing Library, and the CI workflow.
