---
name: eachlabs-workflows
description: The source description, replaced by the override.
---

# EachLabs Workflows

Build, manage, and execute multi-step AI pipelines that chain multiple models together.

## Building a Workflow

### Step 1: Create the Workflow

```bash
curl -X POST https://api.eachlabs.ai/v1/workflows -d '{"name": "x"}'
```

### Step 2: Trigger the Workflow

```bash
curl -X POST https://api.eachlabs.ai/v1/workflows/trigger/wf-1/v2 \
  -d '{"inputs": {"prompt": "a"}, "webhook_secret": "s"}'
curl -X POST https://api.eachlabs.ai/v1/workflows/trigger/wf-1/v2 -d '{"inputs": {}, "priority": 1}'
curl https://api.eachlabs.ai/v1/workflows/executions/ex-1
curl https://api.eachlabs.ai/v1/workflows/wf-1
```

## Version Management
**Version states:** `active`, `archived`, `deleted`

**Locking:** Set `locked: true` to prevent modifications (for production stability).

**Visibility:**
- `allowed_to_share: false` (default) - Private, organization only
- `allowed_to_share: true` - Unlisted, accessible via direct link

The rest of the section.
