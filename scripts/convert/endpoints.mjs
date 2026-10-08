import { hasCommand, parseCurl, splitCommands } from "./curl.mjs";
import { note, todo } from "./report.mjs";

export const HOST_API = "api.eachlabs.ai";
// The legacy workflows host; the current skill calls api.eachlabs.ai/v1/workflows.
export const HOST_WORKFLOWS = "workflows.eachlabs.run";
export const WORKFLOWS_PATH = /\/v1\/workflows\b/;
export const HOST_SENSE = "eachsense-agent";
export const SENSE_PATH = "/v1/chat/completions";

const READ_EXECUTION =
  "Call `get_workflow_execution` with `execution_id` set to the id returned by `trigger_workflow`, and `wait: true` while it says `running`.";

// Which curl call becomes which tool. Each host says how to cut the path out of
// a URL; each row matches a method and a path and returns the lines that replace
// the command. A call no row matches becomes a TODO line.
export const HOSTS = [
  {
    host: HOST_API,
    pathOf: (url) => url.slice(url.indexOf(HOST_API) + HOST_API.length),
    endpoints: [
      { method: "POST", path: /^\/v1\/prediction\/?$/, convert: runModel },
      {
        method: "GET",
        path: /^\/v1\/prediction\/[^/]+$/,
        convert: () => ["Call `get_job` with `prediction_id` set to the id returned by `run_model`."],
      },
      {
        method: "GET",
        path: /^\/v1\/model\?slug=/,
        convert: (m, call) => [`Call \`get_model_schema\` with \`slug\` \`"${decodeURIComponent(call.path.split("slug=")[1])}"\`.`],
      },
      {
        method: "POST",
        path: /^\/v1\/workflows\/trigger\/([^/]+)\/([^/]+)$/,
        convert: (m, call, ctx) => triggerWorkflow(m[1], m[2], call, ctx),
      },
      { method: "GET", path: /^\/v1\/workflows\/executions\/[^/]+$/, convert: () => [READ_EXECUTION] },
      {
        method: "GET",
        path: /^\/v1\/workflows\/[^/]+$/,
        convert: () => ["Call `get_workflow` with `workflow_id` set to the workflow's id or slug."],
      },
    ],
  },
  {
    host: HOST_WORKFLOWS,
    pathOf: (url) => url.slice(url.indexOf("/api/v1") + 7),
    endpoints: [
      { method: "POST", path: /^\/([^/]+)\/trigger$/, convert: (m, call, ctx) => triggerWorkflow(m[1], null, call, ctx) },
      { method: "GET", path: /^\/executions\/[^/]+$/, convert: () => [READ_EXECUTION] },
    ],
  },
];

function jsonBlock(value) {
  return ["```json", JSON.stringify(value, null, 2), "```"];
}

function runModel(m, { body, bodyRaw }, ctx) {
  if (!body) return todo(ctx, `prediction body is not JSON: ${bodyRaw}`);
  const { model, version, input, ...rest } = body;
  if (!model || !input) return todo(ctx, `prediction body without model or input`);
  const lines = ["Call `run_model` with these arguments:", "", ...jsonBlock({ model, version: version ?? "0.0.1", input })];
  const dropped = Object.keys(rest);
  if (dropped.length) note(ctx, `dropped body fields ${dropped.join(", ")} from a run_model call`);
  return lines;
}

// The legacy host carries the version in the body; api.eachlabs.ai has it in the path.
function triggerWorkflow(workflowId, versionFromPath, { body, bodyRaw }, ctx) {
  if (!body) return todo(ctx, `trigger body is not JSON: ${bodyRaw}`);
  const { version_id, inputs, webhook_url, webhook_secret, ...rest } = body;
  if (Object.keys(rest).length) return todo(ctx, `trigger body has unknown fields ${Object.keys(rest).join(", ")}`);
  if (webhook_url || webhook_secret) {
    note(ctx, "dropped webhook_url/webhook_secret from a trigger_workflow call; the tool polls instead");
  }
  const args = { workflow_id: workflowId, version_id: versionFromPath ?? version_id ?? "{versionID}", inputs: inputs ?? {} };
  return ["Call `trigger_workflow` with these arguments:", "", ...jsonBlock(args)];
}

// The lines that replace one curl command.
export function convertCurl(cmd, ctx) {
  const { method, url, body, bodyRaw } = parseCurl(cmd);
  if (!url) return todo(ctx, `cannot read the URL of a command: ${cmd.split("\n")[0]}`);
  const host = HOSTS.find((h) => url.includes(h.host));
  if (host) {
    const path = host.pathOf(url);
    for (const row of host.endpoints) {
      const m = method === row.method ? path.match(row.path) : null;
      if (m) return row.convert(m, { path, body, bodyRaw }, ctx);
    }
    return todo(ctx, `no tool for ${method} ${url}`);
  }
  if (url.includes(HOST_SENSE) || url.includes(SENSE_PATH)) {
    return todo(ctx, `each::sense call ${method} ${url} has no tool in this version`);
  }
  return todo(ctx, `no tool for ${method} ${url}`);
}

// The lines that replace a fenced block holding curl commands, or null to keep
// the block as it is.
export function convertCommandBlock(blockLines, ctx) {
  if (!hasCommand(blockLines)) return null;
  const rendered = [];
  for (const part of splitCommands(blockLines)) {
    if (rendered.length) rendered.push("");
    if (part.kind === "curl") rendered.push(...convertCurl(part.text, ctx));
    else if (part.kind === "comment") rendered.push(part.text);
    else rendered.push(...todo(ctx, `unexpected line in a command block: ${part.text}`));
  }
  return rendered;
}
