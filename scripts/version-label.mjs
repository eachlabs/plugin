#!/usr/bin/env node
// Reads a pull request's version label and decides whether it needs one.
//
// Usage: node scripts/version-label.mjs <base ref> '<labels as a JSON array>'
//
// Prints the part to raise (patch, minor or major), or nothing when the change
// needs no release. Fails when the change ships plugin content without exactly one
// version/* label, because clients update an installed plugin only when its
// version changes.

import { execFileSync } from "node:child_process";

const SHIPPED = [/^skills\//, /^\.mcp\.json$/, /^\.claude-plugin\//, /^\.codex-plugin\//, /^\.agents\//, /^hooks\//, /^commands\//];
const LABELS = ["version/patch", "version/minor", "version/major"];

const [base, labelsJson] = process.argv.slice(2);
if (!base || labelsJson === undefined) {
  console.error("usage: node scripts/version-label.mjs <base ref> '<labels as a JSON array>'");
  process.exit(2);
}

const versionLabels = JSON.parse(labelsJson).filter((l) => l.startsWith("version/"));
const unknown = versionLabels.filter((l) => !LABELS.includes(l));
if (unknown.length > 0) {
  console.error(`Unknown version label ${unknown.join(", ")}; use one of ${LABELS.join(", ")}.`);
  process.exit(1);
}
if (versionLabels.length > 1) {
  console.error(`This pull request has ${versionLabels.join(" and ")}; keep exactly one version/* label.`);
  process.exit(1);
}

const changed = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);
const shipped = changed.filter((f) => SHIPPED.some((re) => re.test(f)));

if (versionLabels.length === 0) {
  if (shipped.length > 0) {
    console.error(`These files reach people who install the plugin, so the pull request needs one of ${LABELS.join(", ")}:`);
    for (const f of shipped) console.error(`  ${f}`);
    process.exit(1);
  }
  process.exit(0);
}

console.log(versionLabels[0].slice("version/".length));
