#!/usr/bin/env node
// Fails when the Claude and Codex manifests disagree on name, version or
// description, or when server.json's version differs from theirs. Both clients
// install the same files, and each updates an installed plugin only when its own
// manifest's version changes.
//
// Usage: node scripts/check-manifests.mjs

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const claude = read(".claude-plugin/plugin.json");
const codex = read(".codex-plugin/plugin.json");

const diffs = ["name", "version", "description"].filter((k) => claude[k] !== codex[k]);
for (const k of diffs) {
  console.error(`${k} differs: .claude-plugin/plugin.json has ${JSON.stringify(claude[k])}, .codex-plugin/plugin.json has ${JSON.stringify(codex[k])}`);
}

// The release publishes server.json to the MCP Registry under the plugin's version.
const server = read("server.json");
if (server.version !== claude.version) {
  console.error(`version differs: .claude-plugin/plugin.json has ${JSON.stringify(claude.version)}, server.json has ${JSON.stringify(server.version)}`);
  diffs.push("server version");
}
process.exit(diffs.length > 0 ? 1 : 0);
