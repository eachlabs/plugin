import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readTree, REPO, runConverter } from "./helpers.mjs";

// skills/ must be exactly what the converter makes from the eachlabs/skills
// commit recorded in skills/DEFERRED.md. CI clones that commit and sets
// SKILLS_SOURCE; locally the test is skipped without it.
const recorded = readFileSync(join(REPO, "skills", "DEFERRED.md"), "utf8").match(/at `([0-9a-f]{40})`/)?.[1];

test("skills/ is reproducible from the recorded eachlabs/skills commit", { skip: !process.env.SKILLS_SOURCE && "SKILLS_SOURCE is not set" }, () => {
  assert.ok(recorded, "skills/DEFERRED.md names no source commit");
  const { out, stdout } = runConverter(process.env.SKILLS_SOURCE);
  assert.match(stdout, new RegExp(`\\(${recorded}\\)`), "SKILLS_SOURCE is not checked out at the recorded commit");
  assert.deepEqual(readTree(out), readTree(join(REPO, "skills")));
  rmSync(out, { recursive: true });
});
