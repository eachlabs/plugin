---
name: eachlabs-workflows
description: Run and inspect multi-step AI workflows that chain multiple EachLabs models into one call. List the organization's workflows, read a workflow's versions and inputs, trigger a version and read the execution's outputs. Use when the user wants to run an existing workflow or check one that is running, and whenever a task chains several models, reuses a fixed prompt, needs a fallback model, runs steps in parallel, routes on a condition, or calls an HTTP API between model steps: check for a matching workflow before chaining models by hand. Building or editing workflows happens in the each::labs dashboard.
---

# EachLabs Workflows

Run multi-step AI pipelines that chain multiple models together, and read their results. Workflows are built and versioned in the each::labs dashboard; this skill lists, inspects, triggers and reads them. each::workflows is completely free to use - you only pay for underlying model costs.

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

In Claude Code, which shows no cards, do not call the tools that show or wait for a card (`request_*` and `wait_for_*`): ask in the chat instead, for a public URL of each file and for the values of any settings, range, crop, workflow inputs or choice.

| Tool | Arguments and result |
| --- | --- |
| `list_workflows` | `limit`, `offset`; the organization's workflows |
| `get_workflow` | `workflow_id`; the workflow with its versions and their definitions |
| `trigger_workflow` | `workflow_id`, `version_id`, `inputs`; starts an execution and waits for it |
| `get_workflow_execution` | `execution_id`; the execution with its status and outputs |
| `request_workflow_inputs` | `workflow_id`, `version_id` (optional; default the production version, else the newest active one), `inputs` (what you have so far), `prompt`; shows the version's inputs as a card the person fills in, with a drop zone inside the form for each image, video or audio input, and returns a `receipt_url`. Call it whenever the workflow needs a file the person has not given as a URL, or has inputs the person did not mention; skip it when every input is already given. Then call `wait_for_workflow_inputs` with the `receipt_url` right away and pass the `workflow_id`, `version_id` and `inputs` it returns to `trigger_workflow`. If it answers `waiting`, call it again |
| `wait_for_workflow_inputs` | `receipt_url` from `request_workflow_inputs`; waits for the person to press Run and returns `workflow_id`, `version_id` and `inputs` for `trigger_workflow` |

If the result says `running`, call `get_workflow_execution` with the returned id and `wait: true`: the server waits for the job and returns the result, so do not sleep or poll between calls; if it still says `running`, call it again the same way. When the person asks to see a result again, or the variant they picked, call `show_files` with the URLs you already have: the result card shows a file only under a tool call. Never run a model or a video tool just to display a file that exists.

## When to Use a Workflow

| The task wants to… | A workflow gives it |
|---|---|
| Ship an AI feature as one call | Prompts, models and intermediate files stay on each::labs; the app only sends inputs |
| Change it without an app release | Edit a prompt or swap a model in a new version; callers keep the same workflow ID |
| Keep working when a model fails | A `fallback` model runs automatically if the first one errors |
| Combine image, video, audio and text | Chain an image edit into a video model, then resize, merge clips or add music |
| Go faster | Run independent steps (one per photo, one per scene) in `parallel` |
| Let AI decide the path | Ask a vision model a question, then route with a `choice` step |
| Use your own systems | Call any public HTTPS API from a step to fetch data or run your own code |

One model with a prompt the user writes is simpler as a direct prediction. Use a workflow once the
prompt is fixed, a fallback is wanted, or there is a second step.

## Model or Workflow

Decide this yourself from the task, using the table above; do not ask the person to choose, and do not expect them to know the word workflow. When a task has more than one step, a fixed prompt reused across runs, needs a fallback, runs steps in parallel, routes on a condition, or calls an HTTP API between model steps, call `list_workflows` first and read the candidates with `get_workflow`; a workflow whose inputs match is one call. If none matches, say that a workflow would fit and that it is built in the each::labs dashboard, then do the steps with the model tools.

## Running a Workflow

### Step 1: Find the Workflow

Call `list_workflows` to see the organization's workflows (`workflows[]` with `workflow_id`, `slug`, `name`, `categories`, `status`; `total_count`). Then call `get_workflow` with `workflow_id`; the result lists the workflow's `versions[]`, each with a `version_id` and the `definition` that holds its `input_schema`. Pick the `version_id` to run. When the version needs a file the person has not given as a URL, or has inputs the person did not mention, call `request_workflow_inputs` so the person fills them in on one card.

### Step 2: Trigger the Workflow

Call `trigger_workflow` with these arguments:

```json
{
  "workflow_id": "{workflowID}",
  "version_id": "v1",
  "inputs": {
    "prompt": "A lighthouse on a cliff at sunset"
  }
}
```

The result is the execution in the shape shown under Step 3: finished with its outputs, or `status` `running` with the `execution_id` when the server hold ran out.

### Step 3: Read the Result

Call `get_workflow_execution` with `execution_id` set to the id returned by `trigger_workflow`, and `wait: true` while it says `running`.

The result, shortened:
```json
{
  "execution_id": "exec-123",
  "status": "completed",
  "output": "https://cdn-us.eachlabs.ai/uploads/3334048f.png",
  "step_outputs": {
    "write_prompt": {"status": "completed", "primary": {"choices": [{"message": {"content": "A dramatic wide-angle photograph of a lighthouse..."}}]}},
    "generate_image": {"status": "completed", "primary": "https://cdn-us.eachlabs.ai/uploads/3334048f.png"}
  }
}
```

The execution is finished when `status` is `completed`, `failed` or `cancelled`. The result carries `execution_id`, `workflow_id`, `version_id`, `status`, `inputs`, `step_outputs` (one entry per step, with its `output` and `primary`), `output`, `error` when it failed, and `total_cost` once finished.

`output` is the result of the last step. `workflow_output` holds named outputs when the version
defines `output_mapping`.

## Reading a Definition

The sections below describe the `definition` that `get_workflow` returns, so that the inputs a version expects and the steps it runs can be read from it. Changing a definition happens in the dashboard.

## Step Types

| Type | Purpose |
|------|---------|
| `model` | Run a model: `model` (slug), `params`, optional `fallback`, `retry`, `timeout_seconds` |
| `parallel` | Run `branches[].steps` at the same time |
| `choice` | Evaluate a condition and run `condition_met_branch` or `default_branch` |
| `pass` | Return a fixed `result` |

HTTP requests and Python code are not step types. They run as model steps through
`eachlabs-http-step` (below) and `eachlabs-python-step` (private beta).

### Model Steps

```json
{
  "id": "restyle",
  "type": "model",
  "model": "nano-banana-2-edit",
  "params": {
    "prompt": "Restyle this photo as $.inputs.style. Keep the person's face unchanged.",
    "image_urls": ["$.inputs.photo"],
    "aspect_ratio": "9:16"
  },
  "retry": {"max_attempts": 3, "retry_on": ["server_error"]}
}
```

### HTTP Calls

Call any public HTTPS API with the `eachlabs-http-step` model. Params: `url`, `method`, `headers`,
`query_params`, `body` (JSON object for `POST`/`PUT`/`PATCH`), `timeout_seconds` (up to 30
recommended) and `fail_on_status` (`"non_2xx"` stops the run on an error response).

```json
{
  "id": "product",
  "type": "model",
  "model": "eachlabs-http-step",
  "params": {
    "url": "https://dummyjson.com/products/$.inputs.product_id",
    "method": "GET",
    "timeout_seconds": 20,
    "fail_on_status": "non_2xx"
  }
}
```

A later step reads the JSON body as `$.product.primary.output.title`. Put credentials in `headers`
(for example `"Authorization": "Bearer <scoped-token>"`); only public URLs are reachable. To run
your own code, host it behind an HTTPS endpoint and `POST` to it.

### Parallel Steps

```json
{
  "id": "prepare",
  "type": "parallel",
  "branches": [
    {"steps": [{"id": "edit_a", "type": "model", "model": "nano-banana-2-edit", "params": {"prompt": "Full-body photo of this person as a traveler in a sunny old-town street.", "image_urls": ["$.inputs.photo_a"]}}]},
    {"steps": [{"id": "edit_b", "type": "model", "model": "nano-banana-2-edit", "params": {"prompt": "Full-body photo of this person as a traveler in a sunny old-town street.", "image_urls": ["$.inputs.photo_b"]}}]}
  ]
}
```

Later steps reference branch steps by their own ids: `$.edit_a.primary`, `$.edit_b.primary`. A
branch can hold several steps that run in order.

### Choice Steps (Conditional Routing)

```json
{
  "id": "portrait",
  "type": "choice",
  "condition": {
    "expression": "$.subject.primary.choices[0].message.content",
    "operator": "string_matches",
    "value": "*PET*"
  },
  "condition_met_branch": {
    "name": "pet",
    "steps": [{"id": "pet_portrait", "type": "model", "model": "nano-banana-2-edit", "params": {"prompt": "A royal oil-painting portrait of this animal wearing a small crown.", "image_urls": ["$.inputs.photo"]}}]
  },
  "default_branch": {
    "name": "person",
    "steps": [{"id": "person_portrait", "type": "model", "model": "nano-banana-2-edit", "params": {"prompt": "A royal oil-painting portrait of this person wearing a crown. Keep their face unchanged.", "image_urls": ["$.inputs.photo"]}}]
  }
}
```

After the choice, `$.portrait.primary` is the result of whichever branch ran, and `selected` holds
its name.

**Condition operators:**

| Category | Operators |
|----------|-----------|
| Comparison | `equals`, `not_equals` (type-strict), `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal` |
| String | `string_equals`, `string_matches` (`*` wildcard pattern; without `*` it must match exactly) |
| Existence | `exists` / `is_not_null` (field present), `is_null` / `not_exists` (field present and null) |
| Logical | `and`, `or`, `not` |

`in` and `not_in` are not supported; combine `equals` conditions with `or`.

```json
{"or": [
  {"expression": "$.inputs.format", "operator": "equals", "value": "mp4"},
  {"expression": "$.inputs.format", "operator": "equals", "value": "webm"}
]}
```

### Pass Steps

```json
{"id": "config", "type": "pass", "result": {"style": "cinematic"}}
```

`$.` references inside `result` are not resolved. Later steps read its fields as `$.config.style`.

## Parameter References

| Reference | Value | Example |
|-----------|-------|---------|
| `$.inputs.<name>` | Workflow input | `$.inputs.prompt` |
| `$.<step_id>.primary` | Main result of a step | `$.restyle.primary` |
| `$.<step_id>.output` | Full result of a step | `$.restyle.output` |
| `$.<step_id>.primary.<field>` | Field of an object result | `$.product.primary.output.title` |
| `$.<choice_id>.primary` | Result of the branch that ran | `$.portrait.primary` |

Conditions use the same paths in `expression`.

## Fallback Configuration

```json
{
  "id": "restyle",
  "type": "model",
  "model": "nano-banana-2-edit",
  "params": {"prompt": "Restyle this photo as $.inputs.style.", "image_urls": ["$.inputs.photo"]},
  "fallback": {
    "enabled": true,
    "model": "gpt-image-v2-edit",
    "params": {"prompt": "Restyle this photo as $.inputs.style.", "image_urls": ["$.inputs.photo"]}
  }
}
```

If the primary model fails, the fallback runs with its own `params`, and `$.restyle.primary` is its
result. In the run's `step_outputs`, `restyle_fallback.fallback.reason` is `primary_failed` or
`not_triggered`.

## Version Management

Each version holds a complete definition, so a workflow can change while callers keep using a previous version. `get_workflow` lists the versions; `trigger_workflow` runs the `version_id` you pass. Versions are created and locked in the dashboard.
