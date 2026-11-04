# Wallet Track App

Next.js frontend for Wallet Track, a private personal finance app. The cross-repo plan and decisions
live in `PLAN.md`, next to this repository's checkout.

## Quick path

```sh
pnpm install
pnpm dev
curl localhost:3000/healthz
```

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Run the dev server |
| `pnpm build` | Build for production |
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

## Layout

| Path | Contents |
|---|---|
| `src/app` | Next routes only: thin pages, `/healthz` route handler, global theme |
| `src/shared/ui` | shadcn/ui components, added with `pnpm dlx shadcn add <name>` |
| `src/shared/api` | Types generated from the contract; never edit by hand |
| `contracts` | Vendored `openapi.yaml`; never edit by hand |

The theme is dark only, on near-black `#0a0a0a`. There is no light palette: `src/app/globals.css`
defines the tokens once, and `<html class="dark">` keeps the `dark:` variants of shadcn components active.

## HTTP contract

`wallet-track-core-app` owns `contracts/openapi.yaml`. To pick up a change, with that repository checked out
next to this one:

```sh
pnpm contract:refresh
pnpm contract:types
```

Commit both results. CI runs `pnpm contract:check`.
