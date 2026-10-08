import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = fileURLToPath(new URL("../../../", import.meta.url));
export const FIXTURES = fileURLToPath(new URL("./fixtures/", import.meta.url));
const CONVERTER = join(REPO, "scripts", "convert-skills.mjs");

// Runs the converter into a fresh directory; returns that directory and stdout.
export function runConverter(source) {
  const out = mkdtempSync(join(tmpdir(), "convert-out-"));
  const stdout = execFileSync("node", [CONVERTER, "--source", source, "--out", out], { encoding: "utf8" });
  return { out, stdout };
}

// Every file under dir as { relative path: content }.
export function readTree(dir) {
  const files = {};
  const walk = (d) => {
    for (const entry of readdirSync(d).sort()) {
      const path = join(d, entry);
      if (statSync(path).isDirectory()) walk(path);
      else files[relative(dir, path)] = readFileSync(path, "utf8");
    }
  };
  walk(dir);
  return files;
}

export function newCtx() {
  return { file: "x/SKILL.md", todos: [], notes: [] };
}
