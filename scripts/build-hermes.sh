#!/usr/bin/env bash
# Builds the Hermes Agent package into <out dir>: the manifest, the README, the
# licence and a copy of skills/. Hermes rejects a symlink out of its package, so
# the skills are copied, not linked.
#
# Usage: scripts/build-hermes.sh <out dir>
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: scripts/build-hermes.sh <out dir>" >&2
  exit 2
fi
out="$1"
case "$out" in /*) ;; *) out="$PWD/$out" ;; esac

cd "$(dirname "$0")/.."

for input in hermes/plugin.json hermes/README.md LICENSE skills; do
  if [ ! -e "$input" ]; then
    echo "error: $input is missing, so the package is not built." >&2
    exit 1
  fi
done
if [ ! -d "$(dirname "$out")" ]; then
  echo "error: the parent of $out does not exist." >&2
  exit 1
fi
if [ -e "$out" ] && { [ ! -d "$out" ] || [ -n "$(ls -A "$out")" ]; }; then
  echo "error: $out is not an empty directory." >&2
  exit 1
fi

mkdir -p "$out"
cp hermes/plugin.json hermes/README.md LICENSE "$out/"
cp -R skills "$out/skills"
