import assert from "node:assert/strict";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { FIXTURES, readTree, runConverter } from "./helpers.mjs";

// fixtures/source is a made-up eachlabs/skills checkout that reaches every branch
// the real skills do not: unknown paths, bad bodies, missing anchors, legacy and
// each::sense hosts, and each reason to skip a skill. fixtures/expected and
// expected.stdout hold what the converter must produce from it.
// To accept a deliberate change: UPDATE_GOLDEN=1 node --test scripts/convert/test/golden.test.mjs
const SOURCE = join(FIXTURES, "source");
const EXPECTED = join(FIXTURES, "expected");
const EXPECTED_STDOUT = join(FIXTURES, "expected.stdout");

test("the made-up source converts to the expected files and summary", () => {
  const { out, stdout } = runConverter(SOURCE);
  const summary = stdout.replaceAll(SOURCE, "<source>").replaceAll(out, "<out>");
  if (process.env.UPDATE_GOLDEN) {
    rmSync(EXPECTED, { recursive: true, force: true });
    cpSync(out, EXPECTED, { recursive: true });
    writeFileSync(EXPECTED_STDOUT, summary);
  }
  assert.deepEqual(readTree(out), readTree(EXPECTED));
  assert.equal(summary, readFileSync(EXPECTED_STDOUT, "utf8"));
  rmSync(out, { recursive: true });
});
