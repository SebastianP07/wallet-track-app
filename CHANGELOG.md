# Changelog

## 0.17.0 — 2026-11-07 — Owner feedback

- Section 08 is per month now: it reads `GET /periods/{period}/overdue-items`, shows the expenses the selected month owes
  with "From <month>" for their month of origin, keeps the paid action and the focus return when a paid row leaves, and
  says so when the month is not opened. Overdue income is still listed in every month.
- To pay donut gains an Overdue slice; KPI, section and close-month copy explain that overdue expenses count in To pay and
  Going out of the month that owes them, and an overdue row in 05/06 says which month owes it. Contract and types
  refreshed. No new dependencies, no new automated tests (T7).
- Savings merged into Accounts for now (D9): one Accounts section lists every account (in two or three columns on wider
  screens) under the backend's Total actual; the Savings section, the Savings KPI tile and the Savings bar are gone, the add
  form asks only for name and balance, and rows no longer show a kind. Sections after Accounts renumber (Overdue is 07).
  `account-groups.ts` removed; `offline.js` lists every account and drops Savings. Contract and types refreshed.
- Fixed, Occasional and Income sections: the add form for a fixed expense has "Repeat every month" ticked, Income offers it
  unticked, and an occasional expense's due date defaults to the month's last day. A row whose template still repeats gets a
  three-way confirmation (Only this month, Stop repeating too, Keep it), with focus on Keep it; other deletes note an overdue
  item's owing month and a paid mark that goes with the row. `ConfirmPanel` takes an optional second action, new
  `CheckboxField` and `useActiveTemplateIds` (shares the templates query), and item writes refresh the templates list.
  Contract and types refreshed.

## 0.16.0 — 2026-11-07 — Production-like local stack

- `Dockerfile`: the web image for the production-like stack and Railway, on `node:26.13.0-trixie-slim` pinned by digest. pnpm
  12.16.1 comes from npm in the build stages, since Node 25 and later ship without Corepack. The runtime stage holds the
  normal `.next` output, production `node_modules`, `public/`, `server.mjs` and `next.config.ts` with the offline CSP it
  imports, and runs `node server.mjs` as `node`. Never `next start` or `standalone`, which would break the BFF.
- First real run on Node 26: the build, the BFF, the CSP nonces, the service worker and the offline page all work on it.
- `.dockerignore` keeps `.env*`, `.next`, `node_modules` and VCS data out of the build context. README: the image and where
  the stack that runs it lives. No code changes, no new dependencies, no new automated tests (T7).

## 0.15.0 — 2026-11-05 — PWA, export and accessibility

- PWA: a manifest through Next's metadata with real and maskable icons, and a hand-written `public/sw.js`. It stores only the
  offline page's files and the body of the last `GET /dashboard`. Cross-origin and non-GET requests, auth, every other read and
  the app's own pages and assets go to the network, so a deploy cannot be stranded behind it.
- Offline reload: no page's HTML is stored, because it would carry a spent nonce. A failed navigation gets the static
  `offline.html`, under its own CSP with no inline code, which draws the saved Dashboard with its age and no control that writes.
  With nothing saved it is a plain offline page. Back online it reloads the real app.
- Offline with the page open: a banner with the data's age and a disabled `fieldset` around the Dashboard. Mutations use
  `networkMode: "always"`, so nothing is ever queued.
- The saved Dashboard goes on logout, logout-all, ending this session, any 401, and when `/login` finds no session. A response on
  its way during a clear is not stored, and saved data past 30 days is refused.
- The worker's URL carries a hash of itself and the offline files, computed at build time, so a change cannot forget to install a
  new worker. It takes over at once.
- CSP: `worker-src 'self'` added. The offline page has its own policy. The manifest is covered by `default-src 'self'`.
- Export: an Export CSV action in the Dashboard, by `fetch` and a blob so that a refusal can be said in the page.
- Accessibility: `FocusKeeper` returns focus when a focused row or form leaves or its button turns disabled. `ConfirmPanel` puts
  focus on the safe choice. A skip link, `main` around the month, the donut out of the Tab order, toggles whose name no longer
  flips along with `aria-pressed`, a visible input border at 3:1, a focus style on the color input, disabled styles on fields and
  chips, and dim template text replaced by a token that passes contrast. The payment form takes focus when it opens, and
  cancelling it, or keeping a payment, returns focus to the toggle that opened it. The month title no longer runs into its
  arrows at 320 px.
- Lighthouse: the charts and Recharts wait until they near the screen, with their tables rendered at once. Sections render one
  task at a time, row forms with react-hook-form and zod load when first opened, zod's locales left the bundle, and the status
  bar, tag filter, Overview and Charts hold their height while loading, which removes the layout shift.
- Refreshed the vendored contract and its types. No new dependencies. No new automated tests (T7).

## 0.14.0 — 2026-11-05 — Passkeys and active sessions

- Login: when the owner has a passkey, the second-factor step offers it first, one tap away, with links to the authenticator and
  a recovery code, and from those back to the passkey. Nothing prompts until the owner taps. A cancelled or timed out prompt stays
  on the step with a message and costs no attempt. A browser with no WebAuthn goes straight to the code, saying why.
- Dashboard: a Security section, the last one. Passkeys can be added, renamed and removed, and adding or removing asks for an
  authenticator or recovery code in the same form. Sessions show device, address, last seen, started, `This device` and
  `Second factor pending`, and ending one asks first. Ending the current one signs out.
- A rejected code and an ended session both answer 401, so the section asks the API again before sending anyone to login.
- A registration that fails after its proof, cancelled at the prompt or refused, says that nothing was added and the code is spent.
- `navigator.credentials` is called directly in `browser-passkeys.ts`, behind the `PasskeyAuthenticator` port, with no new
  dependency. The CSP is unchanged.
- These mutations opt out of the dashboard refresh, since no write here moves a KPI.
- Refreshed the vendored contract and its types. No new automated tests (T7).

## 0.13.0 — 2026-11-05 — Dashboard

- Replaced the placeholder Overview with eight KPIs from `GET /dashboard`: Total actual, To pay, To arrive, Left over, Savings,
  Coming in, Going out and Balance. Every number is the backend's (D1), tags do not narrow them (D5), and a closed month says
  how it treats its overdue items. A month not opened shows its balances, from `GET /accounts`, and a dash for the rest.
- Added the Charts section: a To pay donut, bars for Total actual, To pay, Left over and Savings, and the upcoming due list.
  Each chart has a table of exact values beside it, slices are named on the chart, negative amounts carry their sign, and
  zero months get a sentence rather than an empty chart. Colors were run through the palette validator for the dark surface.
- Recharts loads client-only through `next/dynamic`, so no `style` attribute reaches the server-rendered HTML and the CSP is
  unchanged.
- `QueryProvider` invalidates the dashboard query after every mutation, settled either way. Only logging out opts out.
- Layout pass: Savings moved beside Accounts, Overdue beside Income, and Card charges beside Platforms in a wider slot, with
  section numbers following. On tablet the lists run in two columns. Dropped `SectionPlaceholder`, now unused.
- Removed `ToPayContainer` and `ToPaySummary`, replaced by the Overview. `ACCOUNTS_KEY` joined the shared query keys.
- Added `recharts` 3.10.1 and its peer `react-is` 19.3.1. Refreshed the vendored contract and its types. No new automated
  tests (T7).

## 0.12.0 — 2026-11-05 — Overdue list

- Added `src/modules/overdue`: the Dashboard's Overdue section. The same list shows whatever month is selected, grouped into
  expenses to pay and income to receive under the backend's totals (D1), each row with name, amount, original month and kind.
- One tap marks a row paid or received: it leaves at once, returns in place if the request fails, and the totals follow the
  refetch. Editing, deleting and undoing stay where the original month displays the item.
- The tag filter narrows the rows, while the totals keep covering the whole list, as a month's do (D5).
- `OVERDUE_ITEMS_KEY` sits under the items key, so closing a month and platform, tag or card writes refresh the list. A write
  to a month's item refreshes it too, and settling from the list refreshes every month's items and people.
- Split `ItemList` out of `ItemSection` for a list with no add form or month states. `ItemRow`'s edit and delete became
  optional, and `useOptimisticMutation` gained `refreshes`.
- Refreshed the vendored contract and its types. No new dependencies. No new automated tests (T7).

## 0.11.0 — 2026-11-05 — Shared platforms

- Added `src/modules/platforms`: the Dashboard's Platforms section. Platforms show cost, per-member share, members and card.
  People show what they owe per month, billing frequency, last payment date and coverage end, all from the backend (D1).
- The paid check opens an inline confirmation with the date and months covered, defaulting to the person's frequency. On a
  covered month it offers to remove the payment covering it. The owner has no check.
- People and platforms are added, edited and deleted inline, and members toggle with one tap, in any month state, with no
  new pages or menus.
- Person-linked income rows say Shared platforms, and their delete confirmation says the payment stays. People sit under the
  month's query key, so toggling or deleting an income row refreshes them, and every platforms write refreshes the items.
- `ItemRow` gained an optional `deleteNote`. Deleting a card also refreshes platforms. `PLATFORMS_KEY` joined the shared
  query keys.
- Fixed: `http-client.ts` now reads the body of every error response, including a 403 it retries, so Chromium no longer keeps
  those responses in flight. Errors behave as before.
- Refreshed the vendored contract and its types. No new dependencies. No new automated tests (T7).

## 0.10.0 — 2026-11-04 — Credit cards

- Added `src/modules/cards`: the Dashboard's Card charges section, with charges grouped by card, each card's monthly total
  and the month's total from the backend (D1), inline add, edit and delete with a confirmation step, and a toggle that
  says Expected or Charged. A note states that these charges are informational and that the real outflow is the
  statement payment, registered as an occasional expense (D3).
- Cards are created, edited and deleted inline in the same section, in any month state, with no new pages or menus. The
  delete confirmation states that the card's active templates become inactive and that existing charges stay.
- Charges whose card was deleted appear under Deleted card, and editing one can move it to another card. A card total that
  has not caught up, or could not be loaded, shows a dash and never a number computed here.
- The tag filter hides cards left with no matching charges, and the totals keep covering the whole month (D5). Card totals
  refresh with the month's items, because their query sits under the same key.
- The recurring template form no longer dead-ends with no cards: it links to Card charges and picks up a new card without
  losing what was typed.
- `ItemSection` gained an optional `renderItems`, `DoneToggle` and `ItemRow` the word "charged", and `useItemMutations` keeps
  a new charge's card and shows undo on a card charge as pending in a closed month. No change for other sections.
- `CREDIT_CARDS_KEY` moved to the shared query keys, so templates and cards read one list.
- Refreshed the vendored contract and its types. No new dependencies. No new automated tests (T7).

## 0.9.0 — 2026-11-04 — Income

- Added `src/modules/income`: the Dashboard's Income section, with To arrive from the backend (D1), an expected or
  received toggle, inline add, edit and delete with a confirmation step, and the tag filter. Income has no due date field
  and no urgency badge; each row says Expected, Received or Overdue in words.
- Changes are optimistic and a failure undoes only its own edit. Undo in a closed month shows Overdue, and that month
  loses Add.
- So the sections share one implementation, `useItemMutations`, `ItemRow` and `ItemSection` were extracted from the
  expenses module, and `PaidToggle` became `DoneToggle`, with no change for Fixed and Occasional. Income reuses the
  expenses repository, since both talk to the same endpoints and the same cached month list.
- The tag filter's accessible name and the Tags copy now mention income as well as expenses.
- Refreshed the vendored contract and its types. No new dependencies. No new automated tests (T7).

## 0.8.0 — 2026-11-04 — Expenses and tags

- Added `src/modules/expenses`: the Dashboard's Fixed and Occasional expenses sections, with a one-tap paid toggle,
  inline add, edit and delete with a confirmation step, and an editable due date. Changes are optimistic and a failure
  undoes only its own edit. Quick taps on the toggle reach the server in order.
- The Overview shows To pay and its subtotals. These numbers and the urgency level only ever come from the backend (D1,
  D11). Urgency has a word and an icon as well as its color.
- Added `src/modules/tags`: an inline Tags section, a filter above the sections, and a tag field on expenses and on the
  recurring template form. Tag colors are drawn as an SVG attribute, because the CSP allows no inline styles.
- A month with no period points to the existing Open month action. A closed month keeps its toggle, edit and delete, and
  loses Add, which the contract refuses. Opening or closing a month refreshes its items.
- Moved the optimistic mutation hook to `src/shared/query/use-optimistic-mutation.ts`, with no change for accounts or
  templates, and `statusOf` to the HTTP client. Added `apiPut`.
- Schemas now import zod from `src/shared/validation/zod.ts`, which sets `jitless`: zod's eval probe was being reported
  as a CSP violation, on every page with a form, since Phase 3.
- Refreshed the vendored contract and its types. No new dependencies. No new automated tests (T7).

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
