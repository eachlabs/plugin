#!/usr/bin/env node
// Fails when the Claude and Codex manifests disagree on name, version or
// description, when the Grok manifest has another name or version, or when
// server.json's version differs from theirs. The clients install the same files,
// and each updates an installed plugin only when its own manifest's version
// changes. Grok Build is a terminal and shows no cards, so its description
// leaves them out.
//
// Usage: node scripts/check-manifests.mjs

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const claude = read(".claude-plugin/plugin.json");
const codex = read(".codex-plugin/plugin.json");
const grok = read(".grok-plugin/plugin.json");

const diffs = ["name", "version", "description"].filter((k) => claude[k] !== codex[k]);
for (const k of diffs) {
  console.error(`${k} differs: .claude-plugin/plugin.json has ${JSON.stringify(claude[k])}, .codex-plugin/plugin.json has ${JSON.stringify(codex[k])}`);
}

for (const k of ["name", "version"].filter((k) => claude[k] !== grok[k])) {
  console.error(`${k} differs: .claude-plugin/plugin.json has ${JSON.stringify(claude[k])}, .grok-plugin/plugin.json has ${JSON.stringify(grok[k])}`);
  diffs.push(`grok ${k}`);
}

// The release publishes server.json to the MCP Registry under the plugin's version.
const server = read("server.json");
if (server.version !== claude.version) {
  console.error(`version differs: .claude-plugin/plugin.json has ${JSON.stringify(claude.version)}, server.json has ${JSON.stringify(server.version)}`);
  diffs.push("server version");
}
process.exit(diffs.length > 0 ? 1 : 0);
