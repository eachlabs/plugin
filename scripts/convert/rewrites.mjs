import { anchorMissing } from "./report.mjs";
import { mapProseLines } from "./markdown.mjs";
import { template } from "./template.mjs";

// Sections removed from every skill, matched on the heading. The connector
// replaces the API key; the rest describe calls the plugin leaves out on purpose:
// webhooks (the tools poll instead), creating workflows and versions, bulk
// trigger, authoring rules, and the each::sense workflow builder.
export const DROPPED_SECTIONS = [
  /^## Authentication$/,
  /^## Base URL$/,
  /^## Endpoints$/,
  /^### Step 1: Create the Workflow$/,
  /^### Create\/Update a Version$/,
  /^## Bulk Trigger$/,
  /^## Authoring Rules$/,
  /^## Webhooks$/,
  /^## Webhook \(alternative to polling\)$/,
  /^## Workflow Builder via each::sense$/,
  /^## Example Workflow References$/,
];

// Lines outside code that are removed when they match.
export const DROPPED_LINES = [/X-API-Key/, /EACHLABS_API_KEY/, /scripts\//];

// Rewrites applied, in order, to every line outside code.
export const LINE_REWRITES = [
  {
    re: /`GET (?:https:\/\/api\.eachlabs\.ai)?\/v1\/model\?slug=([^`]+)`/g,
    to: (_, slug) =>
      slug === "<slug>"
        ? "`get_model_schema` with `slug` set to the model slug"
        : `\`get_model_schema\` with \`slug\` \`"${slug}"\``,
  },
  { re: /\*\*Check (model|schema)\*\* (?:— )?`get_model_schema`/g, to: "**Check $1** — call `get_model_schema`" },
  { re: /`request_schema`/g, to: "input schema" },
  { re: /\*\*POST\*\* `https:\/\/api\.eachlabs\.ai\/v1\/prediction` with/g, to: "**Run** — call `run_model` with" },
  {
    re: /\*\*Poll\*\* `GET https:\/\/api\.eachlabs\.ai\/v1\/prediction\/\{id\}` until/g,
    to: "**Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until",
  },
  { re: /, or use a webhook\./g, to: "." },
  { re: /served from `POST https:\/\/api\.eachlabs\.ai\/v1\/prediction`/g, to: "run through `run_model`" },
  { re: /`GET https:\/\/api\.eachlabs\.ai\/v1\/prediction\/\{id\}`/g, to: "`get_job`" },
  { re: /`(?:POST )?https:\/\/api\.eachlabs\.ai\/v1\/prediction`/g, to: "`run_model`" },
  { re: /by sending separate POST requests for each/g, to: "by calling `run_model` once for each" },
  {
    re: /([Aa])uthentication is (?:handled )?exclusively via the EachLabs API key/g,
    to: "$1uthentication is handled by the each::labs connector sign-in",
  },
  // The plugin signs in as the organization's runner key, so a per-key limit is the organization's.
  { re: /\bper key\b/g, to: "per organization" },
];

// Descriptions stay verbatim unless the converted skill no longer does what the source promises.
export const DESCRIPTION_OVERRIDES = {
  "eachlabs-workflows": template("description-workflows"),
};

// Whole-text rewrites for one skill. Each `find` must occur exactly once, or a
// note says so; a list names the same passage in different versions of the source.
export const SKILL_REWRITES = {
  "eachlabs-workflows": [
    {
      find: "Build, manage, and execute multi-step AI pipelines that chain multiple models together.",
      replace:
        "Run multi-step AI pipelines that chain multiple models together, and read their results. Workflows are built and versioned in the each::labs dashboard; this skill lists, inspects, triggers and reads them.",
    },
    { find: "## Building a Workflow\n", replace: template("workflows-model-or-workflow") + "\n" },
    {
      find: [
        'Response:\n```json\n{"execution_id": "exec-123", "status": "queued"}\n```\n',
        'Response:\n```json\n{"execution_id": "exec-123", "status": "queued", "started_at": "..."}\n```\n',
      ],
      replace:
        "The result is the execution in the shape shown under Step 3: finished with its outputs, or `status` `running` with the `execution_id` when the server hold ran out.\n",
    },
    { find: "### Step 3: Poll for Result\n", replace: "### Step 3: Read the Result\n" },
    { find: "Response (shortened):\n", replace: "The result, shortened:\n" },
    { find: "Execution statuses: `running`, `completed`, `failed`, `cancelled`", replace: template("workflows-execution-result") },
    { find: "## Step Types\n", replace: template("workflows-reading-a-definition") + "\n" },
    {
      find: "Each version holds a complete definition, so you can change a workflow while callers keep using a\nprevious version. Trigger a specific version with `/v1/workflows/trigger/{workflowID}/{versionID}`.\nSet `locked: true` on a version to stop further changes.\n",
      replace:
        "Each version holds a complete definition, so a workflow can change while callers keep using a previous version. `get_workflow` lists the versions; `trigger_workflow` runs the `version_id` you pass. Versions are created and locked in the dashboard.\n",
    },
  ],
};

// Passages removed by exact match: response examples from the old workflows
// engine and version settings changed in the dashboard. Each entry lists the
// passage's versions; one that is absent is left alone, since newer sources dropped them.
export const DROPPED_TEXT = {
  "eachlabs-workflows": [
    [
      `
**Version states:** \`active\`, \`archived\`, \`deleted\`

**Locking:** Set \`locked: true\` to prevent modifications (for production stability).

**Visibility:**
- \`allowed_to_share: false\` (default) - Private, organization only
- \`allowed_to_share: true\` - Unlisted, accessible via direct link
`,
    ],
    [
      `Response:
\`\`\`json
{
  "execution_id": "exec-123",
  "workflow_id": "wf-456",
  "status": "completed",
  "inputs": {"prompt": "A sunset landscape"},
  "step_outputs": {
    "generate": {
      "step_id": "generate",
      "status": "completed",
      "output": "https://cdn.example.com/image.png",
      "primary": "https://cdn.example.com/image.png",
      "metadata": {"model": "flux-2-pro", "version": "1.0.0"}
    }
  },
  "output": ["https://cdn.example.com/upscaled.png"]
}
\`\`\`

`,
    ],
  ],
};

// The one alternative that occurs exactly once, or null.
function findOnce(text, alternatives) {
  return alternatives.find((f) => text.split(f).length - 1 === 1) ?? null;
}

export function applySkillRewrites(text, name, ctx) {
  for (const { find, replace } of SKILL_REWRITES[name] ?? []) {
    const alternatives = Array.isArray(find) ? find : [find];
    const hit = findOnce(text, alternatives);
    if (hit === null) {
      anchorMissing(ctx, alternatives);
      continue;
    }
    text = text.replace(hit, replace);
  }
  for (const chunk of DROPPED_TEXT[name] ?? []) {
    const hit = findOnce(text, Array.isArray(chunk) ? chunk : [chunk]);
    if (hit !== null) text = text.replace(hit, "");
  }
  return text;
}

export function rewriteProse(lines) {
  return mapProseLines(lines, (line) => {
    if (DROPPED_LINES.some((re) => re.test(line))) return null;
    for (const { re, to } of LINE_REWRITES) line = line.replace(re, to);
    return line;
  });
}
