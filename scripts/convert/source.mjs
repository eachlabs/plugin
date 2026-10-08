import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const SOURCE_REPO = "https://github.com/eachlabs/skills";

export function cloneSource() {
  const dir = mkdtempSync(join(tmpdir(), "eachlabs-skills-"));
  console.error(`cloning ${SOURCE_REPO} into ${dir}`);
  execFileSync("git", ["clone", "--depth", "1", "--quiet", SOURCE_REPO, dir], { stdio: "inherit" });
  return dir;
}

// Reads the checkout's HEAD commit from .git without running git.
export function sourceCommit(dir) {
  try {
    const head = readFileSync(join(dir, ".git", "HEAD"), "utf8").trim();
    if (!head.startsWith("ref: ")) return head;
    const ref = head.slice(5);
    const refPath = join(dir, ".git", ref);
    if (existsSync(refPath)) return readFileSync(refPath, "utf8").trim();
    const packed = readFileSync(join(dir, ".git", "packed-refs"), "utf8");
    const line = packed.split("\n").find((l) => l.endsWith(" " + ref));
    return line ? line.split(" ")[0] : "unknown";
  } catch {
    return "unknown";
  }
}

// Every file under dir, sorted, so the output never depends on the file system's order.
export function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...listFiles(path));
    else out.push(path);
  }
  return out;
}

export function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
