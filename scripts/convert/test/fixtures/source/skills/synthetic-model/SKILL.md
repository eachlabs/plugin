---
name: synthetic-model
description: A model skill made up for the converter tests.
metadata:
  author: eachlabs
  version: "1.0"
---

# Synthetic Model

Authentication is handled exclusively via the EachLabs API key. The limit is 10 requests per key.

## Authentication

Header: X-API-Key: <your-api-key>

## Base URL

https://api.eachlabs.ai

## Quick Start

1. **Check model** `GET https://api.eachlabs.ai/v1/model?slug=flux-2-pro` and read its `request_schema`.
2. **Check schema** — `GET /v1/model?slug=<slug>`
3. **POST** `https://api.eachlabs.ai/v1/prediction` with the model and input.
4. **Poll** `GET https://api.eachlabs.ai/v1/prediction/{id}` until it finishes, or use a webhook.

Set EACHLABS_API_KEY in your shell first.
Batch runs use scripts/run.sh.
Each image is served from `POST https://api.eachlabs.ai/v1/prediction` and read with `GET https://api.eachlabs.ai/v1/prediction/{id}`.
Process several by sending separate POST requests for each image.

```bash
# Run the model
curl -X POST https://api.eachlabs.ai/v1/prediction \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $EACHLABS_API_KEY" \
  -d '{
    "model": "flux-2-pro",
    "input": {"prompt": "a cat", "image_url": "https://example.com/cat.png"},
    "webhook_url": "https://example.com/hook"
  }'

# Read the result
curl https://api.eachlabs.ai/v1/prediction/abc123 \
  -H "X-API-Key: $EACHLABS_API_KEY"
```

```bash
curl https://api.eachlabs.ai/v1/model?slug=flux%2D2%2Dpro
curl -X POST https://api.eachlabs.ai/v1/unknown/route -d '{"a": 1}'
curl -X POST https://api.eachlabs.ai/v1/prediction -d 'not json'
curl -X POST https://api.eachlabs.ai/v1/prediction -d '{"input": {"prompt": "no model"}}'
curl -X POST https://eachsense-agent.core.eachlabs.run/v1/chat/completions -d '{"messages": []}'
curl -X GET https://other.example.com/v1/thing
curl --help
echo done
```

```json
{"kept": "a block without curl stays as it is", "url": "https://example.com/song.mp3"}
```

```json
{"video_url": "https://example.com/clip.mp4", "file": "https://example.com/no-extension"}
```

### Code with a hash line

```python
# not a heading
print("x")
```

## Webhooks

Webhooks are dropped.

### Retry schedule

Also dropped, since it sits under Webhooks.

## Notes

The last section stays.
