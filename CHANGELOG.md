# Changelog

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
