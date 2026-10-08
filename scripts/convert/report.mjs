import { template } from "./template.mjs";

// What a run collects: converted, deferred and skipped skills, TODO lines and notes.
export function newReport() {
  return { converted: [], deferred: [], skipped: [], todos: [], notes: [] };
}

// A step no tool carries: the skill gets a TODO line and the summary counts it.
export function todo(ctx, reason) {
  ctx.todos.push(`${ctx.file}: ${reason}`);
  return [`TODO(contract): ${reason}`];
}

export function note(ctx, text) {
  ctx.notes.push(`${ctx.file}: ${text}`);
}

// The wording "anchor not found exactly once" is what scripts/sync-skills.sh greps for.
export function anchorMissing(ctx, alternatives) {
  note(ctx, `rewrite anchor not found exactly once: ${JSON.stringify(alternatives[0].slice(0, 60))}`);
}

export function deferredDoc(commit, deferred) {
  return [template("deferred", { commit }), ...deferred.map((d) => `| \`${d.name}\` | ${d.reason} |`), ""].join("\n");
}

// The summary lines; sync-skills.sh greps "TODO(contract): N" and the section headers.
export function printSummary({ source, commit, out, report }) {
  const { converted, deferred, skipped, todos, notes } = report;
  console.log(`source: ${source} (${commit})`);
  console.log(`out: ${out}`);
  console.log("");
  console.log(`converted: ${converted.length}`);
  for (const c of converted) console.log(`  ${c.name} (${c.kind}${c.refs.length ? `, ${c.refs.join(", ")}` : ""})`);
  console.log(`deferred: ${deferred.length}`);
  for (const d of deferred) console.log(`  ${d.name}: ${d.reason}`);
  console.log(`skipped: ${skipped.length}`);
  for (const s of skipped) console.log(`  ${s.name}: ${s.reason}`);
  console.log(`TODO(contract): ${todos.length}`);
  for (const t of todos) console.log(`  ${t}`);
  if (notes.length) {
    console.log(`notes: ${notes.length}`);
    for (const n of notes) console.log(`  ${n}`);
  }
}
