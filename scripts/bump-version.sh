#!/usr/bin/env bash
# Writes the next version into both plugin manifests, the MCP Registry entry
# (server.json) and CHANGELOG.md.
#
# Usage: scripts/bump-version.sh <patch|minor|major> "<changelog line>"
#
# The next version is the latest v* tag raised by the given part; with no tag yet
# the current version is 0.1.0, the version the plugin first shipped with. Running
# it again with the same part changes nothing, and with another part it rewrites
# the same unreleased entry, so it is safe on every push and label change.
# Prints the version it wrote.
set -euo pipefail

part="${1:-}"
title="${2:-}"
case "$part" in patch | minor | major) ;; *)
  echo "usage: scripts/bump-version.sh <patch|minor|major> \"<changelog line>\"" >&2
  exit 2
  ;;
esac

latest="$(git tag -l 'v*' --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n1 || true)"
current="${latest#v}"
current="${current:-0.1.0}"

IFS=. read -r major minor patch <<<"$current"
case "$part" in
  major) next="$((major + 1)).0.0" ;;
  minor) next="${major}.$((minor + 1)).0" ;;
  patch) next="${major}.${minor}.$((patch + 1))" ;;
esac

node - "$current" "$next" "$title" <<'JS'
const fs = require("fs");
const [current, next, rawTitle] = process.argv.slice(2);
const title = rawTitle.replace(/^\[[^\]]+\]\s*/, "");
const newer = (a, b) => {
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

for (const manifest of [".claude-plugin/plugin.json", ".codex-plugin/plugin.json", "server.json"]) {
  const plugin = JSON.parse(fs.readFileSync(manifest, "utf8"));
  plugin.version = next;
  fs.writeFileSync(manifest, JSON.stringify(plugin, null, 2) + "\n");
}

const file = "CHANGELOG.md";
const intro =
  "# Changelog\n\nEach release changes `version` in `.claude-plugin/plugin.json`,\n" +
  "`.codex-plugin/plugin.json` and `server.json`; Claude and Codex update an\n" +
  "installed plugin only when that number changes.\n";
const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : intro;
const heading = /^## (\d+\.\d+\.\d+)$/m.exec(text);
let out;
if (heading && newer(heading[1], current)) {
  // The top entry is not released yet, so it belongs to this change: renumber it.
  out = text.slice(0, heading.index) + `## ${next}` + text.slice(heading.index + heading[0].length);
} else {
  const entry = `## ${next}\n\n- ${title || "No description."}\n\n`;
  out = heading ? text.slice(0, heading.index) + entry + text.slice(heading.index) : text.trimEnd() + "\n\n" + entry.trimEnd() + "\n";
}
fs.writeFileSync(file, out);
JS

echo "$next"
