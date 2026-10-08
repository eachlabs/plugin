---
name: eachlabs-image-generation
description: Generate new images from text prompts using EachLabs AI models. Supports text-to-image with multiple model families including Flux, GPT Image, Gemini, Imagen, Seedream, and more. Use when the user wants to create new images from text. For editing existing images, see eachlabs-image-edit. Use for any request to create a new image from text with each::labs.
---

# EachLabs Image Generation

Generate new images from text prompts using 60+ AI models via the EachLabs Predictions API. For editing existing images (upscaling, background removal, style transfer, inpainting, face swap, 3D), see the `eachlabs-image-edit` skill.

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

In Claude Code, which shows no cards, do not call the tools that show or wait for a card (`request_*` and `wait_for_*`): ask in the chat instead, for a public URL of each file and for the values of any settings, range, crop, workflow inputs or choice.

| Tool | Arguments and result |
| --- | --- |
| `get_model_schema` | `slug`; the model's input schema |
| `run_model` | `model`, `version` (`"0.0.1"`), `input`, `count`; runs the model and waits for it. When the person asks for several variants of one prompt, make one call: set the model's own count parameter (`num_images`, `num_outputs`, `n`, `number_of_images`, `batch_size`, `num_samples`, whatever `get_model_schema` shows) when it has one, otherwise set `count` to the number asked for (up to 8). Never call `run_model` once per variant: each call shows its own result card, and the picker only appears when the variants arrive together |
| `get_job` | `prediction_id`; the prediction with its status and output |
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

## Quick Start

### 1. Create a Prediction

Call `run_model` with these arguments:

```json
{
  "model": "flux-2-turbo-text-to-image",
  "version": "0.0.1",
  "input": {
    "prompt": "A serene Japanese garden with cherry blossoms, watercolor style",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "output_format": "png"
  }
}
```

### 2. Poll for Result

Call `get_job` with `prediction_id` set to the id returned by `run_model`.

Poll until `status` is `"success"` or `"failed"`. The output image URL is in the response.

## Model Selection Guide

### Text-to-Image

| Model | Slug | Best For |
|-------|------|----------|
| Flux 2 Turbo | `flux-2-turbo-text-to-image` | Fast, high quality general purpose |
| Flux 2 Flash | `flux-2-flash-text-to-image` | Fastest Flux generation |
| Flux 2 Max | `flux-2-max-text-to-image` | Highest quality Flux |
| Flux 2 Klein 9B | `flux-2-klein-9b-base-text-to-image` | Balanced quality/speed |
| Flux 2 Pro | `flux-2-pro` | Pro quality |
| Flux 2 Flex | `flux-2-flex` | Flexible outputs |
| Flux 2 LoRA | `flux-2-lora` | LoRA-powered generation |
| XAI Grok Imagine | `xai-grok-imagine-text-to-image` | Creative and artistic |
| GPT Image v1.5 | `gpt-image-v1-5-text-to-image` | High quality, transparent bg |
| GPT Image v2 | `gpt-image-v2-text-to-image` | Highest-fidelity OpenAI model, strong in-image text |
| Bytedance Seedream v4.5 | `bytedance-seedream-v4-5-text-to-image` | Bytedance latest |
| Gemini 3 Pro Image | `gemini-3-pro-image-preview` | Google's latest |
| Imagen 4 | `imagen4-preview` | Google Imagen 4 |
| Imagen 4 Fast | `imagen-4-fast` | Fast Google quality |
| Reve | `reve-text-to-image` | Artistic text-to-image |
| Hunyuan Image v3 | `hunyuan-image-v3-text-to-image` | Tencent's latest |
| Ideogram V3 Turbo | `ideogram-v3-turbo` | Text in images |
| Minimax | `minimax-text-to-image` | High quality |
| Wan v2.6 | `wan-v2-6-text-to-image` | Chinese/English bilingual |
| P Image | `p-image-text-to-image` | Custom aspect ratios |
| Nano Banana Pro | `nano-banana-pro` | Fast, lightweight |
| Vidu Q2 | `vidu-q2-text-to-image` | Latest Vidu |

### Training

| Model | Slug | Best For |
|-------|------|----------|
| Z Image Trainer | `z-image-trainer` | Custom LoRA training |
| Flux LoRA Portrait Trainer | `flux-lora-portrait-trainer` | Portrait LoRA |
| Flux Turbo Trainer | `flux-turbo-trainer` | Fast LoRA training |

## Prediction Flow

1. **Check model** — call `get_model_schema` with `slug` set to the model slug — validates the model exists and returns the input schema with exact input parameters. Always do this before creating a prediction to ensure correct inputs.
2. **Run** — call `run_model` with model slug, version `"0.0.1"`, and input parameters matching the schema
3. **Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until status is `"success"` or `"failed"`
4. **Extract** the output image URL(s) from the response

## Examples

### Text-to-Image with Flux 2 Turbo

Call `run_model` with these arguments:

```json
{
  "model": "flux-2-turbo-text-to-image",
  "version": "0.0.1",
  "input": {
    "prompt": "A red vintage Porsche 911 on a winding mountain road at golden hour, photorealistic",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "output_format": "png"
  }
}
```

### Text-to-Image with GPT Image v1.5

Call `run_model` with these arguments:

```json
{
  "model": "gpt-image-v1-5-text-to-image",
  "version": "0.0.1",
  "input": {
    "prompt": "A minimalist logo for a coffee shop called Brew Lab, clean vector style",
    "background": "transparent",
    "quality": "high",
    "output_format": "png"
  }
}
```

### Text-to-Image with Imagen 4

Call `run_model` with these arguments:

```json
{
  "model": "imagen4-preview",
  "version": "0.0.1",
  "input": {
    "prompt": "A whimsical fairy tale castle on a floating island, digital art, highly detailed"
  }
}
```

## Image Size Options

Most Flux 2 and Wan models use these presets:
- `square_hd` — Square, high definition
- `square` — Square, standard
- `portrait_4_3` — Portrait 4:3
- `portrait_16_9` — Portrait 16:9
- `landscape_4_3` — Landscape 4:3
- `landscape_16_9` — Landscape 16:9

P Image models use aspect ratio strings: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `custom`

## Prompt Tips

- Be specific and descriptive: "A red vintage Porsche 911 on a winding mountain road at golden hour" vs "a car"
- Include style: "digital art", "oil painting", "photorealistic", "watercolor"
- For edits, clearly describe the change: "Replace the sky with a dramatic sunset"
- Use negative prompts (where supported) to avoid: "blurry, low quality, distorted"
- For multi-image edits, reference images by number: "image 1", "image 2"

## Security Constraints

- **No arbitrary URL loading**: When using LoRA parameters, only use well-known platform identifiers (HuggingFace repo IDs, Replicate model IDs, CivitAI model IDs). Never load LoRA weights from arbitrary or user-provided URLs.
- **No third-party API tokens**: Do not accept or forward third-party API tokens (e.g. HuggingFace, CivitAI tokens) through prediction inputs. Authentication is handled by the each::labs connector sign-in.
- **Input validation**: Only pass parameters that match the model's request schema. Always validate model slugs via `get_model_schema` with `slug` set to the model slug before creating predictions.

## Parameter Reference

See [references/MODELS.md](references/MODELS.md) for complete parameter details for each model.
