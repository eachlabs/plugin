import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { classify } from "./classify.mjs";
import { convertCommandBlock } from "./endpoints.mjs";
import {
  buildFrontmatter,
  collapseBlankLines,
  dropSections,
  insertBeforeFirstH2,
  mapFencedBlocks,
  splitFrontmatter,
} from "./markdown.mjs";
import { deferredDoc, newReport } from "./report.mjs";
import { applySkillRewrites, DESCRIPTION_OVERRIDES, DROPPED_SECTIONS, rewriteProse } from "./rewrites.mjs";
import { listFiles, sourceCommit, writeFile } from "./source.mjs";
import { mediaSentence } from "./media.mjs";
import { detectInputs, toolsSection } from "./tools.mjs";

// Converts every skill under <source>/skills into <out> and writes <out>/DEFERRED.md.
export function convert({ source, out }) {
  const skillsDir = join(source, "skills");
  if (!existsSync(skillsDir)) throw new Error(`${skillsDir} does not exist`);
  const commit = sourceCommit(source);
  const report = newReport();
  for (const name of readdirSync(skillsDir).sort()) {
    const skillDir = join(skillsDir, name);
    if (statSync(skillDir).isDirectory()) convertSkill(skillDir, name, out, report);
  }
  writeFile(join(out, "DEFERRED.md"), deferredDoc(commit, report.deferred));
  return { commit, report };
}

function convertSkill(skillDir, name, out, report) {
  const skillFile = join(skillDir, "SKILL.md");
  if (!existsSync(skillFile)) return report.skipped.push({ name, reason: "no SKILL.md" });
  const text = readFileSync(skillFile, "utf8");
  const kind = classify(text, name);
  if (kind === "deferred") return report.deferred.push({ name, reason: "each::sense is deferred" });
  if (kind === "no-known-host") return report.skipped.push({ name, reason: "calls no known host; nothing to convert" });
  const split = splitFrontmatter(text);
  if (!split) return report.skipped.push({ name, reason: "no frontmatter" });

  const ctx = { file: `${name}/SKILL.md`, todos: report.todos, notes: report.notes };
  try {
    buildFrontmatter(split.frontmatter, name, DESCRIPTION_OVERRIDES[name]);
  } catch (err) {
    return report.skipped.push({ name, reason: err.message });
  }
  const sentence = kind === "workflows" ? undefined : mediaSentence(name, ctx);
  const frontmatter = buildFrontmatter(split.frontmatter, name, DESCRIPTION_OVERRIDES[name], sentence);
  writeFile(join(out, name, "SKILL.md"), frontmatter + "\n" + convertBody(split.body, { name, kind, isSkill: true, ctx }));

  // Reference files go through the same rules. The workflows skill's examples
  // only show how to create a workflow, which the plugin does not do.
  const refs = [];
  const refDir = join(skillDir, "references");
  if (existsSync(refDir) && kind !== "workflows") {
    for (const path of listFiles(refDir)) {
      const rel = relative(skillDir, path);
      const refCtx = { file: `${name}/${rel}`, todos: report.todos, notes: report.notes };
      writeFile(join(out, name, rel), convertBody(readFileSync(path, "utf8"), { name, kind, isSkill: false, ctx: refCtx }));
      refs.push(rel);
    }
  }
  report.converted.push({ name, kind, refs });
}

// One skill or reference file, in the order the steps apply.
function convertBody(body, { name, kind, isSkill, ctx }) {
  let lines = applySkillRewrites(body, name, ctx).split("\n");
  lines = dropSections(lines, DROPPED_SECTIONS);
  lines = mapFencedBlocks(lines, (block) => convertCommandBlock(block, ctx));
  lines = rewriteProse(lines);
  if (isSkill) lines = insertBeforeFirstH2(lines, toolsSection(kind, detectInputs(body)));
  lines = collapseBlankLines(lines);
  return lines.join("\n") + "\n";
}
