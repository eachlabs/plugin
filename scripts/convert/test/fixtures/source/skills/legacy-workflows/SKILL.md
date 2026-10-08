---
name: legacy-workflows
description: A skill that still calls the legacy workflows host.
---

# Legacy Workflows

```bash
curl -X POST https://workflows.eachlabs.run/api/v1/wf-9/trigger -d '{"version_id": "v1", "inputs": {"prompt": "p"}, "webhook_url": "https://example.com/h"}'
curl -X POST https://workflows.eachlabs.run/api/v1/wf-9/trigger -d '{"inputs": {"prompt": "p"}}'
curl https://workflows.eachlabs.run/api/v1/executions/ex-9
curl https://workflows.eachlabs.run/api/v1/categories
curl -X POST https://workflows.eachlabs.run/api/v1/wf-9/trigger -d 'oops'
```
