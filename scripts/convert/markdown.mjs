const FENCE = /^```/;

export function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  return { frontmatter: m[1], body: text.slice(m[0].length) };
}

// Keeps name and description, the description replaced when an override is
// given and otherwise extended by `descriptionSuffix`. The source's metadata
// block describes the curl version, not this file.
export function buildFrontmatter(frontmatter, expectedName, descriptionOverride, descriptionSuffix) {
  const lines = frontmatter.split("\n");
  const name = lines.find((l) => /^name:/.test(l));
  const description = lines.find((l) => /^description:/.test(l));
  if (!name || !description) throw new Error("frontmatter without name or description");
  if (name.replace(/^name:\s*/, "").trim() !== expectedName) {
    throw new Error(`frontmatter name does not match folder ${expectedName}`);
  }
  let text = descriptionOverride ?? descriptionValue(description);
  if (!descriptionOverride && descriptionSuffix) text = `${text} ${descriptionSuffix}`;
  // A JSON string is valid YAML. A plain value is not once it holds ": " or " #".
  return `---\n${name}\ndescription: ${JSON.stringify(text)}\n---\n`;
}

// The text of a one-line `description:`, plain or quoted.
export function descriptionValue(line) {
  const value = line.replace(/^description:/, "").trim();
  if (/^".*"$/.test(value)) return JSON.parse(value);
  if (/^'.*'$/.test(value)) return value.slice(1, -1).replaceAll("''", "'");
  return value;
}

function headingLevel(line) {
  const m = line.match(/^(#{1,6}) /);
  return m ? m[1].length : 0;
}

// Removes each heading a pattern matches and everything under it, up to the next
// heading of the same or a higher level. A `#` inside fenced code is not a heading.
export function dropSections(lines, patterns) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const level = headingLevel(line);
    if (level && patterns.some((re) => re.test(line))) {
      i++;
      let inFence = false;
      while (i < lines.length) {
        if (FENCE.test(lines[i])) inFence = !inFence;
        const l = headingLevel(lines[i]);
        if (!inFence && l && l <= level) break;
        i++;
      }
      // Collapse the blank line that preceded the removed heading.
      while (out.length && out[out.length - 1] === "" && i < lines.length && lines[i] === "") out.pop();
      continue;
    }
    out.push(line);
    i++;
  }
  return out;
}

// Calls replace with the inner lines of each fenced block. When it returns lines,
// they take the block's place, fences included; when it returns null, the block stays.
export function mapFencedBlocks(lines, replace) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (!FENCE.test(lines[i])) {
      out.push(lines[i++]);
      continue;
    }
    const open = lines[i++];
    const block = [];
    while (i < lines.length && !FENCE.test(lines[i])) block.push(lines[i++]);
    const close = i < lines.length ? lines[i] : null;
    i++;
    const replaced = replace(block);
    if (replaced !== null) {
      out.push(...replaced);
      continue;
    }
    out.push(open, ...block);
    if (close !== null) out.push(close);
  }
  return out;
}

// Calls edit on each line outside fenced code; edit returns the new line, or null to drop it.
export function mapProseLines(lines, edit) {
  const out = [];
  let inFence = false;
  for (const line of lines) {
    if (FENCE.test(line)) inFence = !inFence;
    if (inFence || FENCE.test(line)) {
      out.push(line);
      continue;
    }
    const edited = edit(line);
    if (edited !== null) out.push(edited);
  }
  return out;
}

export function insertBeforeFirstH2(lines, section) {
  const idx = lines.findIndex((l) => /^## /.test(l));
  if (idx === -1) return [...lines, "", ...section];
  return [...lines.slice(0, idx), ...section, ...lines.slice(idx)];
}

// One blank line at most between blocks, none at the start or the end.
export function collapseBlankLines(lines) {
  const out = [];
  for (const line of lines) {
    if (line === "" && out[out.length - 1] === "") continue;
    out.push(line);
  }
  while (out.length && out[out.length - 1] === "") out.pop();
  while (out.length && out[0] === "") out.shift();
  return out;
}
