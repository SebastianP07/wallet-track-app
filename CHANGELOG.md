# Changelog

## 0.7.0 — 2026-11-04 — Periods and templates

- Added `src/modules/periods`. Under the month switcher, the month now shows its status: not opened, with an "Open
  month" action; open, with a "Close month" action and a confirmation that says what will happen; or closed. Added a
  link back to the current month.
- Added the Dashboard's Recurring templates section: inline add, edit, activate, deactivate and delete for fixed,
  income and card charge templates. Changes are optimistic and a failure undoes only its own edit. Opening and closing
  wait for the server.
- Card selection lists the cards that exist. With none, the select and Save are disabled and a hint says why.
- The switcher stops at the contract's limits, and `?period=` below 2000-01 falls back to the current month. Moved
  `year-month.ts` from `dashboard` to `periods`, and `SelectField` gained an `error`. `account-forms` exports its
  `nameField`.
- The contract gives no item count for a period, so none is shown. Refreshed the vendored contract and its types. No
  new dependencies. No new automated tests (T7).

## 0.6.0 — 2026-11-04 — Accounts and savings

- Added `src/modules/accounts` and the Dashboard's Accounts and Savings sections: inline add, rename and update
  balance, delete with a confirmation step, and empty, loading and error states. Balances are current values, so
  the month switcher does not touch them.
- Totals only ever come from the backend (D1). Optimistic updates change the rows, and the total dims until the
  refetch brings it back in step. A failure undoes only its own edit and shows an error.
- `formatCOP` shows whole pesos with Colombian separators. The amount input takes typed separators and negatives, and
  refuses decimals rather than guess at them. It uses a decimal keypad with a sign button, because iOS gives that
  keypad no minus key.
- Added `apiPatch` and `apiDelete`, a `destructive` button variant, `SelectField` and a `trailing` slot on `Field`.
  Split the section placeholder into `SectionFrame` and `SectionPlaceholder`.
- No new dependencies. No new automated tests (T7).

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
