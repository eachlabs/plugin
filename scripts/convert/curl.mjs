// Splits the lines of a fenced block into comment lines, curl commands and other
// lines. A command starts at a line beginning with `curl` and continues while
// lines end with a backslash.
export function splitCommands(blockLines) {
  const parts = [];
  let i = 0;
  while (i < blockLines.length) {
    const line = blockLines[i];
    if (/^\s*curl\b/.test(line)) {
      const cmd = [line];
      while (/\\\s*$/.test(cmd[cmd.length - 1]) && i + 1 < blockLines.length) cmd.push(blockLines[++i]);
      // A single-quoted body can span lines without backslashes; read on until the quotes balance.
      while ((cmd.join("\n").split("'").length - 1) % 2 === 1 && i + 1 < blockLines.length) cmd.push(blockLines[++i]);
      parts.push({ kind: "curl", text: cmd.join("\n") });
    } else if (/^\s*#/.test(line)) {
      parts.push({ kind: "comment", text: line.replace(/^\s*#\s?/, "") });
    } else if (line.trim() !== "") {
      parts.push({ kind: "other", text: line });
    }
    i++;
  }
  return parts;
}

export function hasCommand(blockLines) {
  return blockLines.some((l) => /^\s*curl\b/.test(l));
}

// The method (GET when no -X), the first URL, and the -d body as text and as JSON (null when it is not JSON).
export function parseCurl(text) {
  const flat = text.replace(/\\\n/g, " ");
  const method = (flat.match(/-X\s+([A-Z]+)/) || [, "GET"])[1];
  const url = (flat.match(/https?:\/\/[^\s'"\\]+/) || [])[0];
  const bodyMatch = flat.match(/-d\s+'([\s\S]*?)'(?:\s|$)/);
  let body = null;
  let bodyRaw = null;
  if (bodyMatch) {
    bodyRaw = bodyMatch[1];
    try {
      body = JSON.parse(bodyRaw);
    } catch {
      body = null;
    }
  }
  return { method, url, body, bodyRaw };
}
