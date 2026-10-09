#!/usr/bin/env node
// Fails when a file under skills/ still carries anything from the curl-and-key
// version of a skill: a curl command, the API key variable, or a host; or when a
// SKILL.md frontmatter value is one strict YAML rejects. Prints every hit as
// path:line and exits 1 if there is any.
//
// Usage: node scripts/check-skills.mjs [skills-dir]

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const skillsDir = process.argv[2] ?? join(root, "skills");

// \bcurl\b: the word, so a prompt about curly hair does not trip it.
const forbidden = [
  { name: "curl", re: /\bcurl\b/i },
  { name: "EACHLABS_API_KEY", re: /EACHLABS_API_KEY/ },
  { name: "api.eachlabs.ai", re: /api\.eachlabs\.ai/ },
  { name: "workflows.eachlabs.run", re: /workflows\.eachlabs\.run/ },
  { name: "eachsense-agent", re: /eachsense-agent/ },
];

// GitHub parses frontmatter strictly; `claude plugin validate` does not. A
// value must be a JSON string, or plain text with no ": " or " #" and no
// leading indicator character.
function frontmatterHits(path, lines) {
  if (!path.endsWith("SKILL.md")) return [];
  if (lines[0] !== "---") return [`${path}:1: no frontmatter`];
  const end = lines.indexOf("---", 1);
  if (end < 0) return [`${path}:1: frontmatter not closed`];
  const hits = [];
  for (let i = 1; i < end; i++) {
    const m = lines[i].match(/^([a-z][\w-]*):[ ](.*)$/);
    if (!m) {
      hits.push(`${path}:${i + 1}: frontmatter line is not \`key: value\``);
      continue;
    }
    const value = m[2];
    if (value.startsWith('"')) {
      try {
        JSON.parse(value);
      } catch {
        hits.push(`${path}:${i + 1}: ${m[1]} is not a valid double-quoted string`);
      }
    } else if (value === "" || /: | #|:$/.test(value) || /^[-?:,[\]{}#&*!|>'%@`\s]/.test(value)) {
      hits.push(`${path}:${i + 1}: ${m[1]} must be double-quoted to be valid YAML`);
    }
  }
  return hits;
}

function* walk(dir) {
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

let files = 0;
const hits = [];
for (const path of walk(skillsDir)) {
  files++;
  const lines = readFileSync(path, "utf8").split("\n");
  hits.push(...frontmatterHits(relative(root, path), lines));
  lines.forEach((line, i) => {
    for (const { name, re } of forbidden) {
      if (re.test(line)) hits.push(`${relative(root, path)}:${i + 1}: ${name}`);
    }
  });
}

if (files === 0) {
  console.error(`check-skills: no files under ${skillsDir}`);
  process.exit(1);
}
if (hits.length > 0) {
  console.error(hits.join("\n"));
  console.error(`check-skills: ${hits.length} hit(s) in ${files} file(s)`);
  process.exit(1);
}
console.log(`check-skills: ${files} file(s) clean`);
