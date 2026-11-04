#!/usr/bin/env bash
# Copies the HTTP contract from the sibling wallet-track-core-app checkout, which owns it.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_file="$repo_root/../wallet-track-core-app/contracts/openapi.yaml"
target_file="$repo_root/contracts/openapi.yaml"

if [[ ! -f "$source_file" ]]; then
  echo "contract:refresh: $source_file not found; check out wallet-track-core-app next to this repository" >&2
  exit 1
fi

cp "$source_file" "$target_file"
echo "contract:refresh: updated contracts/openapi.yaml"
