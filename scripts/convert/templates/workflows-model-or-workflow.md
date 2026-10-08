## Model or Workflow

Decide this yourself from the task, using the table above; do not ask the person to choose, and do not expect them to know the word workflow. When a task has more than one step, a fixed prompt reused across runs, needs a fallback, runs steps in parallel, routes on a condition, or calls an HTTP API between model steps, call `list_workflows` first and read the candidates with `get_workflow`; a workflow whose inputs match is one call. If none matches, say that a workflow would fit and that it is built in the each::labs dashboard, then do the steps with the model tools.

## Running a Workflow

### Step 1: Find the Workflow

Call `list_workflows` to see the organization's workflows (`workflows[]` with `workflow_id`, `slug`, `name`, `categories`, `status`; `total_count`). Then call `get_workflow` with `workflow_id`; the result lists the workflow's `versions[]`, each with a `version_id` and the `definition` that holds its `input_schema`. Pick the `version_id` to run. When the version needs a file the person has not given as a URL, or has inputs the person did not mention, call `request_workflow_inputs` so the person fills them in on one card.
