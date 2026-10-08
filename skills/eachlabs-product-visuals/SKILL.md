---
name: eachlabs-product-visuals
description: Generate professional e-commerce product photography and videos using EachLabs AI models. Product shots, background replacement, lifestyle scenes, and 360-degree views. Use when the user needs product images for e-commerce or marketing. Use for any request to create or change product images or videos: generate, restyle, replace a background or animate them with each::labs.
---

# EachLabs Product Visuals

Generate professional product photography, e-commerce visuals, and product videos using EachLabs AI models.

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

In Claude Code, which shows no cards, do not call the tools that show or wait for a card (`request_*` and `wait_for_*`): ask in the chat instead, for a public URL of each file and for the values of any settings, range, crop, workflow inputs or choice.

| Tool | Arguments and result |
| --- | --- |
| `get_model_schema` | `slug`; the model's input schema |
| `run_model` | `model`, `version` (`"0.0.1"`), `input`, `count`; runs the model and waits for it. When the person asks for several variants of one prompt, make one call: set the model's own count parameter (`num_images`, `num_outputs`, `n`, `number_of_images`, `batch_size`, `num_samples`, whatever `get_model_schema` shows) when it has one, otherwise set `count` to the number asked for (up to 8). Never call `run_model` once per variant: each call shows its own result card, and the picker only appears when the variants arrive together |
| `get_job` | `prediction_id`; the prediction with its status and output |
| `request_file` | `prompt` saying what to upload, `accept` (`"image"`), `count` (the number of files the person mentioned), `max` (the most files the model takes for that input: the array's `maxItems` in `get_model_schema`, or the video tool's input limit); shows an upload card in the conversation and returns a `receipt_url`. Call it as soon as the model needs a file the person has not given as a URL; do not ask for a URL first, and mention that a URL works too. Then call `wait_for_upload` with the `receipt_url` right away: it returns each file's name, kind and `public_url` once the upload is done, and the `public_url` is the input URL. If it answers `waiting`, call it again. When a model takes files with different roles (a person and a garment, a source face and a target), show one card per role so each URL is unambiguous; otherwise one card takes the whole set, for example all the images of a slideshow |
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

## Recommended Models

### E-Commerce Specific

| Task | Model | Slug |
|------|-------|------|
| Product photoshoot | Product to Photoshoot | `product-to-photoshoot` |
| Product on model | Product Photo to Modelshoot | `product-photo-to-modelshoot` |
| Color variations | Product Colors | `product-colors` |
| Food photography | Food Photos | `food-photos` |
| Background removal | Product Background Remover | `product-backround-remover` |
| Image upscaling | Product Photo Upscaler | `product-photo-upscaler` |
| Home scene placement | Product Home View | `product-home-view` |
| Product shot | Bria Product Shot | `bria-product-shot` |
| Product shoot | Product Shoot | `product-shoot` |
| Product arc shot | Eachlabs Product Arc Shot | `eachlabs-product-arc-shot-v1` |
| Product zoom in | Eachlabs Product Zoom In | `eachlabs-product-zoom-in-v1` |

### General Purpose

| Task | Model | Slug |
|------|-------|------|
| Product photography | GPT Image v1.5 | `gpt-image-v1-5-text-to-image` |
| Background replacement | GPT Image v1.5 Edit | `gpt-image-v1-5-edit` |
| Product editing | Flux 2 Turbo Edit | `flux-2-turbo-edit` |
| Multi-angle views | Qwen Image Edit | `qwen-image-edit-2511-multiple-angles` |
| Background removal | Rembg Enhance | `rembg-enhance` |
| Background removal | Eachlabs BG Remover | `eachlabs-bg-remover-v1` |
| Image upscaling | Eachlabs Upscaler Pro | `eachlabs-image-upscaler-pro-v1` |
| Ad inpainting | SDXL Ad Inpaint | `sdxl-ad-inpaint` |
| Custom product style | Z Image Trainer | `z-image-trainer` |
| Product video | Pixverse v5.6 Image-to-Video | `pixverse-v5-6-image-to-video` |

## Prediction Flow

1. **Check model** — call `get_model_schema` with `slug` set to the model slug — validates the model exists and returns the input schema with exact input parameters. Always do this before creating a prediction to ensure correct inputs.
2. **Run** — call `run_model` with model slug, version `"0.0.1"`, and input matching the schema
3. **Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until status is `"success"` or `"failed"`
4. **Extract** output URL from response

## Workflows

### Product on White Background

Call `run_model` with these arguments:

```json
{
  "model": "gpt-image-v1-5-edit",
  "version": "0.0.1",
  "input": {
    "prompt": "Place this product on a clean white background with soft studio lighting and subtle shadows",
    "image_urls": [
      "https://example.com/product.jpg"
    ],
    "background": "opaque",
    "quality": "high"
  }
}
```

### Lifestyle Scene Generation

Call `run_model` with these arguments:

```json
{
  "model": "gpt-image-v1-5-edit",
  "version": "0.0.1",
  "input": {
    "prompt": "Place this coffee mug on a cozy wooden desk in a modern home office with warm morning light, lifestyle photography",
    "image_urls": [
      "https://example.com/mug.jpg"
    ],
    "quality": "high"
  }
}
```

### Multi-Angle Product Views

Call `run_model` with these arguments:

```json
{
  "model": "qwen-image-edit-2511-multiple-angles",
  "version": "0.0.1",
  "input": {
    "image_urls": [
      "https://example.com/product.jpg"
    ],
    "horizontal_angle": 45,
    "vertical_angle": 15,
    "zoom": 5
  }
}
```

Generate multiple angles by running separate predictions with different `horizontal_angle` values (0, 45, 90, 135, 180, 225, 270, 315 for a full 360).

### Product with Transparent Background

Call `run_model` with these arguments:

```json
{
  "model": "gpt-image-v1-5-edit",
  "version": "0.0.1",
  "input": {
    "prompt": "Remove the background from this product image",
    "image_urls": [
      "https://example.com/product.jpg"
    ],
    "background": "transparent",
    "output_format": "png"
  }
}
```

### Product Video from Image

Call `run_model` with these arguments:

```json
{
  "model": "pixverse-v5-6-image-to-video",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/product-studio.jpg",
    "prompt": "Slow cinematic camera rotation around the product with dramatic studio lighting",
    "duration": "5",
    "resolution": "1080p"
  }
}
```

## Prompt Tips for Products

- Specify lighting: "soft studio lighting", "dramatic side lighting", "natural window light"
- Mention surface: "marble surface", "wooden table", "clean white background"
- Include shadows: "soft shadows", "reflection on surface"
- Add context: "lifestyle setting", "in-use shot", "flat lay arrangement"
- For batch catalog shots, maintain consistency with similar prompts

## Batch Processing

For catalog-scale processing, create multiple predictions in parallel by calling `run_model` once for each product. Poll each prediction independently.

## Parameter Reference

See the [eachlabs-image-generation](../eachlabs-image-generation/references/MODELS.md) and [eachlabs-video-generation](../eachlabs-video-generation/references/MODELS.md) references for complete model parameters.
