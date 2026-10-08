---
name: legacy-workflows
description: A skill that still calls the legacy workflows host.
---

# Legacy Workflows

Call `trigger_workflow` with these arguments:

```json
{
  "workflow_id": "wf-9",
  "version_id": "v1",
  "inputs": {
    "prompt": "p"
  }
}
```

Call `trigger_workflow` with these arguments:

```json
{
  "workflow_id": "wf-9",
  "version_id": "{versionID}",
  "inputs": {
    "prompt": "p"
  }
}
```

Call `get_workflow_execution` with `execution_id` set to the id returned by `trigger_workflow`, and `wait: true` while it says `running`.

TODO(contract): no tool for GET https://workflows.eachlabs.run/api/v1/categories

TODO(contract): trigger body is not JSON: oops

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

| Tool | Arguments and result |
| --- | --- |
| `list_workflows` | `limit`, `offset`; the organization's workflows |
| `get_workflow` | `workflow_id`; the workflow with its versions and their definitions |
| `trigger_workflow` | `workflow_id`, `version_id`, `inputs`; starts an execution and waits for it |
| `get_workflow_execution` | `execution_id`; the execution with its status and outputs |
| `request_workflow_inputs` | `workflow_id`, `version_id` (optional; default the production version, else the newest active one), `inputs` (what you have so far), `prompt`; shows the version's inputs as a card the person fills in, with a drop zone inside the form for each image, video or audio input, and returns a `receipt_url`. Call it whenever the workflow needs a file the person has not given as a URL, or has inputs the person did not mention; skip it when every input is already given. Then call `wait_for_workflow_inputs` with the `receipt_url` right away and pass the `workflow_id`, `version_id` and `inputs` it returns to `trigger_workflow`. If it answers `waiting`, call it again |
| `wait_for_workflow_inputs` | `receipt_url` from `request_workflow_inputs`; waits for the person to press Run and returns `workflow_id`, `version_id` and `inputs` for `trigger_workflow` |

If the result says `running`, call `get_workflow_execution` with the returned id and `wait: true`: the server waits for the job and returns the result, so do not sleep or poll between calls; if it still says `running`, call it again the same way. When the person asks to see a result again, or the variant they picked, call `show_files` with the URLs you already have: the result card shows a file only under a tool call. Never run a model or a video tool just to display a file that exists.
