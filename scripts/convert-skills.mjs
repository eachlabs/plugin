#!/usr/bin/env node
// Converts the curl-and-key skills in a checkout of eachlabs/skills into the
// plugin's skills, which call the each::labs connector's tools instead.
//
// Usage:
//   node scripts/convert-skills.mjs --source <checkout of eachlabs/skills> [--out <dir>]
//
// Without --source it clones https://github.com/eachlabs/skills into a temporary
// directory. --out defaults to <repo>/skills. The steps are in convert/pipeline.mjs;
// the curl-to-tool table is convert/endpoints.mjs; the plugin's own text is in
// convert/templates/. Same input, same output: no timestamps, every list sorted.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { convert } from "./convert/pipeline.mjs";
import { printSummary } from "./convert/report.mjs";
import { cloneSource } from "./convert/source.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = { source: null, out: join(repoRoot, "skills") };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--source") args.source = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log("Usage: node scripts/convert-skills.mjs --source <eachlabs/skills checkout> [--out <dir>]");
      process.exit(0);
    } else throw new Error(`unknown argument ${argv[i]}`);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const source = args.source ?? cloneSource();
const { commit, report } = convert({ source, out: args.out });
printSummary({ source, commit, out: args.out, report });
