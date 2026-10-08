import { readFileSync } from "node:fs";

const DIR = new URL("./templates/", import.meta.url);

// Reads templates/<name>.md without its final newline and fills each {{key}}.
export function template(name, vars = {}) {
  let text = readFileSync(new URL(`${name}.md`, DIR), "utf8").replace(/\n$/, "");
  for (const [key, value] of Object.entries(vars)) text = text.split(`{{${key}}}`).join(value);
  return text;
}
