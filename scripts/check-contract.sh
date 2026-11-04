#!/usr/bin/env bash
# Fails when the generated types are stale, or the vendored contract differs from a sibling checkout.
# CI has no sibling checkout, so only the generated types are checked there.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

source_file="../wallet-track-core-app/contracts/openapi.yaml"
if [[ -f "$source_file" ]] && ! cmp -s "$source_file" contracts/openapi.yaml; then
  echo "contract:check: contracts/openapi.yaml differs from the sibling checkout; run pnpm contract:refresh" >&2
  exit 1
fi

generated="$(mktemp)"
trap 'rm -f "$generated"' EXIT
pnpm exec openapi-typescript contracts/openapi.yaml --output "$generated" >/dev/null
if ! cmp -s "$generated" src/shared/api/openapi.ts; then
  echo "contract:check: src/shared/api/openapi.ts is stale; run pnpm contract:types" >&2
  exit 1
fi
echo "contract:check: up to date"
