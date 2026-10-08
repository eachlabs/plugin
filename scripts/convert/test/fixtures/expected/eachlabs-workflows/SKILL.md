---
name: eachlabs-workflows
description: Run and inspect multi-step AI workflows that chain multiple EachLabs models into one call. List the organization's workflows, read a workflow's versions and inputs, trigger a version and read the execution's outputs. Use when the user wants to run an existing workflow or check one that is running, and whenever a task chains several models, reuses a fixed prompt, needs a fallback model, runs steps in parallel, routes on a condition, or calls an HTTP API between model steps: check for a matching workflow before chaining models by hand. Building or editing workflows happens in the each::labs dashboard.
---

# EachLabs Workflows

Run multi-step AI pipelines that chain multiple models together, and read their results. Workflows are built and versioned in the each::labs dashboard; this skill lists, inspects, triggers and reads them.

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

In an app that shows no cards, such as Claude Code or another terminal, do not call the tools that show or wait for a card (`request_*` and `wait_for_*`): ask in the chat instead, for a public URL of each file and for the values of any settings, range, crop, workflow inputs or choice.

| Tool | Arguments and result |
| --- | --- |
| `list_workflows` | `limit`, `offset`; the organization's workflows |
| `get_workflow` | `workflow_id`; the workflow with its versions and their definitions |
| `trigger_workflow` | `workflow_id`, `version_id`, `inputs`; starts an execution and waits for it |
| `get_workflow_execution` | `execution_id`; the execution with its status and outputs |
| `request_workflow_inputs` | `workflow_id`, `version_id` (optional; default the production version, else the newest active one), `inputs` (what you have so far), `prompt`; shows the version's inputs as a card the person fills in, with a drop zone inside the form for each image, video or audio input, and returns a `receipt_url`. Call it whenever the workflow needs a file the person has not given as a URL, or has inputs the person did not mention; skip it when every input is already given. Then call `wait_for_workflow_inputs` with the `receipt_url` right away and pass the `workflow_id`, `version_id` and `inputs` it returns to `trigger_workflow`. If it answers `waiting`, call it again |
| `wait_for_workflow_inputs` | `receipt_url` from `request_workflow_inputs`; waits for the person to press Run and returns `workflow_id`, `version_id` and `inputs` for `trigger_workflow` |

If the result says `running`, call `get_workflow_execution` with the returned id and `wait: true`: the server waits for the job and returns the result, so do not sleep or poll between calls; if it still says `running`, call it again the same way. When the person asks to see a result again, or the variant they picked, call `show_files` with the URLs you already have: the result card shows a file only under a tool call. Never run a model or a video tool just to display a file that exists.

## Model or Workflow

Decide this yourself from the task, using the table above; do not ask the person to choose, and do not expect them to know the word workflow. When a task has more than one step, a fixed prompt reused across runs, needs a fallback, runs steps in parallel, routes on a condition, or calls an HTTP API between model steps, call `list_workflows` first and read the candidates with `get_workflow`; a workflow whose inputs match is one call. If none matches, say that a workflow would fit and that it is built in the each::labs dashboard, then do the steps with the model tools.

## Running a Workflow

### Step 1: Find the Workflow

Call `list_workflows` to see the organization's workflows (`workflows[]` with `workflow_id`, `slug`, `name`, `categories`, `status`; `total_count`). Then call `get_workflow` with `workflow_id`; the result lists the workflow's `versions[]`, each with a `version_id` and the `definition` that holds its `input_schema`. Pick the `version_id` to run. When the version needs a file the person has not given as a URL, or has inputs the person did not mention, call `request_workflow_inputs` so the person fills them in on one card.

### Step 2: Trigger the Workflow

Call `trigger_workflow` with these arguments:

```json
{
  "workflow_id": "wf-1",
  "version_id": "v2",
  "inputs": {
    "prompt": "a"
  }
}
```

TODO(contract): trigger body has unknown fields priority

Call `get_workflow_execution` with `execution_id` set to the id returned by `trigger_workflow`, and `wait: true` while it says `running`.

Call `get_workflow` with `workflow_id` set to the workflow's id or slug.

## Version Management
The rest of the section.
