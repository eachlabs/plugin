---
name: gpt-image-v2
description: Generate and edit images using OpenAI's GPT Image v2 via EachLabs. Supports text-to-image (gpt-image-v2-text-to-image) and instruction-based editing (gpt-image-v2-edit). Use when the user specifically asks for GPT Image 2 / OpenAI image generation, or needs high-fidelity photorealism, precise text rendering, or reference-faithful edits. Use for any request to create or edit an image with GPT Image 2 on each::labs.
---

# GPT Image v2

OpenAI's GPT Image v2 on the EachLabs Predictions API. GPT Image v2 delivers higher-fidelity images than v1.5 with stronger prompt understanding, improved compositional consistency, physically accurate lighting, and enhanced fine-detail rendering — including reliable in-image text.

Two model slugs:

| Slug | Category | Use |
|------|----------|-----|
| `gpt-image-v2-text-to-image` | Text to Image | Generate new images from a prompt |
| `gpt-image-v2-edit` | Image to Image | Edit an existing image with natural-language instructions |

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

In an app that shows no cards, such as Claude Code or another terminal, do not call the tools that show or wait for a card (`request_*` and `wait_for_*`): ask in the chat instead, for a public URL of each file and for the values of any settings, range, crop, workflow inputs or choice.

| Tool | Arguments and result |
| --- | --- |
| `get_model_schema` | `slug`; the model's input schema |
| `run_model` | `model`, `version` (`"0.0.1"`), `input`, `count`; runs the model and waits for it. When the person asks for several variants of one prompt, make one call: set the model's own count parameter (`num_images`, `num_outputs`, `n`, `number_of_images`, `batch_size`, `num_samples`, whatever `get_model_schema` shows) when it has one, otherwise set `count` to the number asked for (up to 8). Never call `run_model` once per variant: each call shows its own result card, and the picker only appears when the variants arrive together |
| `get_job` | `prediction_id`; the prediction with its status and output |
| `request_file` | `prompt` saying what to upload, `accept` (`"image"`), `count` (the number of files the person mentioned), `max` (the most files the model takes for that input: the array's `maxItems` in `get_model_schema`, or the video tool's input limit); shows an upload card in the conversation and returns a `receipt_url`. In an app that shows cards, call it as soon as the model needs a file the person has not given as a URL; do not ask for a URL first, and mention that a URL works too. Then call `wait_for_upload` with the `receipt_url` right away: it returns each file's name, kind and `public_url` once the upload is done, and the `public_url` is the input URL. If it answers `waiting`, call it again. When a model takes files with different roles (a person and a garment, a source face and a target), show one card per role so each URL is unambiguous; otherwise one card takes the whole set, for example all the images of a slideshow |
| `wait_for_upload` | `receipt_url` from `request_file`; waits for the person's upload and returns the uploaded files with their `public_url` |
| `request_parameters` | `model`, `version`, `input` (what you would pass to `run_model`), `prompt`; shows the model's settings as a card the person can adjust, and returns a `receipt_url`. Use it when the person asks to adjust or choose settings, or when the model has options the person did not mention (aspect ratio, duration, number of outputs) and the run costs more than a few cents; otherwise call `run_model` directly. Then call `wait_for_parameters` with the `receipt_url` right away and run the model with the `input` it returns. After the first run of a model in a conversation, end your reply with one markdown line of exactly this shape: `**Adjust generation settings:** <two or three of this model's settings in plain words, such as aspect ratio, duration or number of images>. Just ask.` Never use the words card, widget, tool or parameters in that line. Write it once per conversation, and skip it when the person has already adjusted settings |
| `show_files` | `urls` (1 to 8 public URLs on each::labs storage), `title`; shows files the person already has as a result card: a picked variant, an earlier result, an uploaded input. No model runs |
| `wait_for_parameters` | `receipt_url` from `request_parameters`; waits for the person to press Run and returns `model`, `version` and `input` for `run_model` |
| `wait_for_choice` | `receipt_url` from a result that holds several outputs (`choice_receipt_url` in the result; the card offers a choice only when the person asked for several variants). Always call it right after showing the results: it returns once the person selects a variant and presses Use this variant, and you continue with that one. If it answers `waiting`, call it again; do not ask the person to type which one they want while the card is waiting |
| `request_trim` | `url` (a video or audio file on each::labs storage), `kind` (`"video"` or `"audio"`), `prompt`; shows the file with a timeline and two handles for the start and the end, and returns a `receipt_url`. Use it when the person wants to cut, shorten, trim or keep part of a clip and has not given exact times; when they give the seconds, call `trim` directly. Then call `wait_for_edit` with the `receipt_url` right away and call `trim` with `input_url` set to the `url` and the `start` and `duration` it returns |
| `request_crop` | `url` (a video or image on each::labs storage), `prompt`; shows the first frame with a rectangle the person moves and resizes, with aspect presets, and returns a `receipt_url`. Use it when the person wants to crop or reframe and has not given exact pixels; when they give the pixels, call `crop` directly. Then call `wait_for_edit` with the `receipt_url` right away and call `crop` with `input_url` set to the `url` and the `x`, `y`, `width` and `height` it returns |
| `wait_for_edit` | `receipt_url` from `request_trim` or `request_crop`; waits for the person to press the button and returns the range (`start`, `duration`) or the rectangle (`x`, `y`, `width`, `height`) with the `url`. If it answers `waiting`, call it again |
| `list_workflows` | When the task has more than one step, a fixed prompt reused across runs, or needs a fallback, call it first: the organization may have a workflow that does the whole thing in one call. Read a candidate with `get_workflow` and run it with `trigger_workflow` (the workflows skill has the details). If none matches, do the steps with the tools above |

If the result says `running`, call `get_job` with the returned id and `wait: true`: the server waits for the job and returns the result, so do not sleep or poll between calls; if it still says `running`, call it again the same way. When the person asks to see a result again, or the variant they picked, call `show_files` with the URLs you already have: the result card shows a file only under a tool call. Never run a model or a video tool just to display a file that exists.

When a result is an edit of an image or video the person gave, the result card has a Compare toggle that shows the input and the result side by side; do not describe the difference in words unless asked.

## When to use

- User asks for "GPT Image", "OpenAI image", "gpt-image-2", or the image model behind ChatGPT.
- High-fidelity photorealism with accurate in-image text (posters, infographics, packaging, signage).
- Brand-consistent product photography with legible labels and logos.
- Instruction-following edits that must preserve the subject and layout of a reference image.

For a wider model comparison (Flux, Seedream, Imagen, etc.) see `eachlabs-image-generation`. For other edit models see `eachlabs-image-edit`.

## Prediction Flow

1. **(Recommended) Check schema** — `get_model_schema` with `slug` `"gpt-image-v2-text-to-image"` to see the current input schema. Do the same for `gpt-image-v2-edit`.
2. **Run** — call `run_model` with `model`, `version: "0.0.1"`, and `input`.
3. **Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until `status` is `"success"` or `"error"`.
4. **Extract** the output URLs from `output` (array).

## Quick Start — Text to Image

Call `run_model` with these arguments:

```json
{
  "model": "gpt-image-v2-text-to-image",
  "version": "0.0.1",
  "input": {
    "prompt": "A minimalist poster reading \"BREW LAB\" in bold serif, steam rising from a ceramic mug, warm paper texture, editorial photography"
  }
}
```

Typical processing time: **~40 seconds**.

## Quick Start — Edit

Call `run_model` with these arguments:

```json
{
  "model": "gpt-image-v2-edit",
  "version": "0.0.1",
  "input": {
    "prompt": "Replace the background with a sunlit loft interior while keeping the product label and angle identical",
    "image_url": "https://your-cdn.example.com/product.jpg"
  }
}
```

Typical processing time: **~100 seconds**. Reference images are always processed at high fidelity, so input image tokens (and cost) are higher than other GPT Image models.

## Polling

Call `get_job` with `prediction_id` set to the id returned by `run_model`.

| Status | Meaning |
|--------|---------|
| `processing` | Still running — poll again |
| `success` | Done — read `output` (array of URLs) |
| `error` | Failed — read `message` / `details` |

## Pricing

Both models use **dynamic token-based pricing**:

| Token type | Rate |
|------------|------|
| Text input | $5 / 1M tokens |
| Image input | $10 / 1M tokens |
| Text output | $40 / 1M tokens |
| Image output | $30 / 1M tokens |

If the token breakdown is unavailable, EachLabs falls back to a "medium 1024×1024 equivalent" rate.

> `gpt-image-v2-edit` always processes reference images at high fidelity, so image-input tokens (and cost) run noticeably higher than with `gpt-image-v1-5-edit` or Nano Banana. Prefer downscaling references to 1024px on the long edge before upload unless you need high detail.

## Prompt Tips

- **In-image text**: wrap the exact copy in double quotes (`"BREW LAB"`) and specify typography ("bold serif", "sans-serif headline"). v2 renders dense paragraphs and multilingual layouts reliably.
- **Composition**: describe subject, framing, lens, and lighting separately. v2 respects compositional directives better than v1.5.
- **Edits**: be specific about what must stay unchanged ("keep the label, angle, and lighting identical; only replace the background").
- **Photorealism**: add concrete physical cues ("raking 45° sunlight, soft falloff, subtle skin SSS") rather than generic adjectives.

## Rate Limits & Limits

| Limit | Value |
|-------|-------|
| Create requests | 100 / minute per organization |
| Concurrent predictions | 10 per organization |
| File inputs | Publicly reachable HTTPS URLs only — no data-URIs, no localhost |

## Errors

Error body: `{ "status": "error", "message": "...", "details": "..." }`

| Code | Meaning |
|------|---------|
| 400 | Invalid input |
| 404 | Unknown model or prediction id |
| 429 | Rate limited — back off |
| 5xx | Retry with exponential backoff |

## Security Constraints

- **No arbitrary URL loading**: `image_url` must point to your own HTTPS-reachable storage (S3, GCS, CDN). Do not forward user-pasted URLs without validation.
- **No third-party API tokens**: never forward OpenAI / Anthropic / HF tokens through `input` — authentication is handled by the each::labs connector sign-in.
- **Validate before calling**: always resolve the live input schema via `get_model_schema` with `slug` set to the model slug before constructing `input`. The schema is the source of truth.

## Parameter Reference

See [references/MODELS.md](references/MODELS.md) for the full per-slug parameter table.
