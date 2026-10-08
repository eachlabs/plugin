---
name: eachlabs-image-edit
description: Edit, transform, upscale, and enhance images using EachLabs AI models. Supports image editing, style transfer, background removal, upscaling, inpainting, face swap, virtual try-on, 3D generation, and image analysis. Use when the user wants to edit or transform existing images. Use for any request to change an image: edit, restyle, retouch, upscale, remove or replace a background, or try clothes on with each::labs.
---

# EachLabs Image Edit

Edit, transform, and enhance existing images using 130+ AI models via the EachLabs Predictions API.

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

## Model Selection Guide

### General Image Editing

| Model | Slug | Best For |
|-------|------|----------|
| Flux 2 Turbo Edit | `flux-2-turbo-edit` | Fast high quality editing |
| Flux 2 Flash Edit | `flux-2-flash-edit` | Fastest editing |
| Flux 2 Max Edit | `flux-2-max-edit` | Highest quality editing |
| Flux 2 Pro Edit | `flux-2-pro-edit` | Pro quality editing |
| Flux 2 Flex Edit | `flux-2-flex-edit` | Flexible editing |
| Flux 2 Edit | `flux-2-edit` | Standard Flux editing |
| Flux 2 LoRA Edit | `flux-2-lora-edit` | LoRA-powered editing |
| XAI Grok Imagine Edit | `xai-grok-imagine-image-edit` | Creative edits |
| GPT Image v1.5 Edit | `gpt-image-v1-5-edit` | High quality (up to 10 images) |
| GPT Image v2 Edit | `gpt-image-v2-edit` | Highest-fidelity OpenAI edit, reference-faithful, strong in-image text |
| Bytedance Seedream v4.5 Edit | `bytedance-seedream-v4-5-edit` | Bytedance latest |
| Gemini 3 Pro Image Edit | `gemini-3-pro-image-preview-edit` | Google editing |
| Qwen Image Edit Plus | `qwen-image-edit-plus` | Advanced Qwen editing |
| Reve Fast Edit | `reve-fast-edit` | Fast artistic editing |
| Reve Edit | `reve-edit` | Artistic editing |
| Chrono Edit | `chrono-edit` | Temporal editing |
| Dream Omni 2 Edit | `dreamomni2-edit` | Dream editing |
| Kling O1 | `kling-o1` | Latest Kling editor |
| Seedream V4 Edit | `seedream-v4-edit` | Seedream editing |
| SeedEdit 3.0 | `seededit-3-0` | SeedEdit editing |
| Nano Banana Pro Edit | `nano-banana-pro-edit` | Lightweight editing |
| Nano Banana Edit | `nano-banana-edit` | Basic editing |

### Multi-Image Context Editing

| Model | Slug | Best For |
|-------|------|----------|
| Flux Kontext Max | `flux-kontext-max` | Best multi-image context |
| Flux Kontext Pro | `flux-kontext-pro` | Pro multi-image context |
| Flux Kontext Dev | `flux-kontext-dev` | Dev multi-image context |
| Multi Image Kontext Max | `multi-image-kontext-max` | Multi-image max |
| Multi Image Kontext Pro | `multi-image-kontext-pro` | Multi-image pro |
| Multi Image Kontext | `multi-image-kontext` | Multi-image base |
| Flux Kontext Dev LoRA | `flux-kontext-dev-lora` | LoRA context editing |
| P Image Edit | `p-image-edit` | Multi-image editing |
| Wan v2.6 I2I | `wan-v2-6-image-to-image` | Multi-image reference |

### Multi-Angle Views

| Model | Slug | Best For |
|-------|------|----------|
| Qwen Multi-Angle | `qwen-image-edit-2511-multiple-angles` | Camera angle views |
| Qwen Image Edit | `qwen-ai-image-edit` | Qwen editing |

### Upscaling & Enhancement

| Model | Slug | Best For |
|-------|------|----------|
| Topaz Image Upscale | `topaz-upscale-image` | Best quality upscale |
| Flux Vision Upscaler | `flux-vision-upscaler` | AI upscaling |
| Recraft Clarity Upscale | `recraft-clarity-upscale` | Clarity enhancement |
| CCSR Upscaler | `ccsr` | Detail restoration |
| Each Upscaler | `each-upscaler` | General upscaling |
| Eachlabs Pro Upscaler | `eachlabs-image-upscaler-pro-v1` | Pro upscaling |
| Real ESRGAN | `real-esrgan` | Face enhancement |
| Real ESRGAN A100 | `real-esrgan-a100` | Fast face enhancement |
| GFPGAN | `gfpgan` | Face restoration |
| Tencent Flux SRPO | `tencent-flux-srpo-image-to-image` | Super resolution |

### Background Removal & Inpainting

| Model | Slug | Best For |
|-------|------|----------|
| Rembg | `rembg` | Background removal |
| Rembg Enhance | `rembg-enhance` | Enhanced bg removal |
| Eachlabs BG Remover | `eachlabs-bg-remover-v1` | Background removal |
| Flux Fill Pro | `flux-fill-pro` | Inpainting |
| Stable Diffusion Inpainting | `stable-diffusion-inpainting` | Classic inpainting |
| Realistic Background | `realistic-background` | Background replacement |
| SDXL Ad Inpaint | `sdxl-ad-inpaint` | Ad background |
| Realistic Vision Inpainting | `realisitic-vision-v3-inpainting` | Realistic inpainting |

### Style Transfer & Effects

| Model | Slug | Best For |
|-------|------|----------|
| ByteDance Style Changer | `bytedance` | Style transfer |
| Nano Banana Pro Sketch | `nano-banana-pro-sketch` | Sketch conversion |
| Nano Banana Pro Comic | `nano-banana-pro-comic-art` | Comic art style |
| Nano Banana Pro Realism | `nano-banana-pro-realism` | Photo-realistic |
| Cartoonify | `cartoonify` | Cartoon style |
| Illusion Diffusion | `illusion-diffusion-hq` | Optical illusions |
| Fog Effect | `salih-girgin-fog-effect-image-to-image` | Fog effect |

### Post-Processing Effects

| Model | Slug | Best For |
|-------|------|----------|
| Post Processing Combine | `post-processing` | Combined effects |
| Vignette | `post-processing-vignette` | Vignette effect |
| Sharpen | `post-processing-sharpen` | Sharpening |
| Grain | `post-processing-grain` | Film grain |
| Color Correction | `post-processing-color-correction` | Color adjustment |
| Color Tint | `post-processing-color-tint` | Color tinting |
| Blur | `post-processing-blur` | Blur effect |
| Desaturate | `post-processing-desaturate` | Desaturation |
| Solarize | `post-processing-solarize` | Solarize effect |
| Dodge Burn | `post-processing-dodge-burn` | Dodge & burn |
| Chromatic Aberration | `post-processing-chromatic-aberration` | Chromatic aberration |
| Parabolize | `post-processing-parabolize` | Parabolize effect |

### Face & Portrait

| Model | Slug | Best For |
|-------|------|----------|
| AI Face Swap V1 | `aifaceswap-face-swap` | Face swap |
| Eachlabs Face Swap | `each-faceswap-v1` | Face swap |
| Face Swap | `face-swap-new` | Face swap |
| Face to Sticker | `face-to-sticker` | Sticker generation |
| Instant ID | `instant-id` | Avatar generation |
| Instant ID Anime | `instant-id-ip-adapter` | Anime avatar |
| Photomaker | `photomaker` | Photo composition |
| Photomaker Style | `photomaker-style` | Style composition |
| Omni Zero | `omni-zero` | Zero-shot identity |
| AI Face Aesthetics | `ai-face-aesthetics` | Face analysis |
| Baby Generator | `baby-generator` | Baby face generation |
| Hairstyle Changer | `change-haircut` | Change hairstyle |
| Couple Image Gen v2 | `couple-image-generation-v2` | Couple images |
| Become Image | `become-image` | Transform into style |
| Higgsfield AI Soul | `higgsfield-ai-soul` | Soul styling |

### Virtual Try-On & Fashion

| Model | Slug | Best For |
|-------|------|----------|
| Kolors Virtual Try-On | `kling-v1-5-kolors-virtual-try-on` | Best virtual try-on |
| IDM VTON | `idm-vton` | Virtual try-on |

### Image Reframing

| Model | Slug | Best For |
|-------|------|----------|
| Luma Photon Reframe | `luma-photon-reframe-image` | Image reframing |
| Luma Photon Flash Reframe | `luma-photon-flash-reframe-image` | Fast reframing |
| Luma Reframe Image | `reframe-image` | Dream Machine reframe |

### Reference-Based Generation

| Model | Slug | Best For |
|-------|------|----------|
| Vidu Q2 Reference | `vidu-q2-reference-to-image` | Reference-based |
| Minimax Subject Reference | `minimax-subject-reference` | Subject reference |
| Ideogram Character | `ideogram-character` | Character consistency |
| Flux Redux Dev | `flux-redux-dev` | Style reference |
| Flux Redux Schnell | `flux-redux-schnell` | Fast style reference |

### ControlNet & Depth

| Model | Slug | Best For |
|-------|------|----------|
| Flux Dev ControlNet | `flux-dev-controlnet` | Flux ControlNet |
| Flux Canny Pro | `flux-canny-pro` | Edge-guided |
| Flux Depth Pro | `flux-depth-pro` | Depth-guided |
| Flux Depth Dev | `flux-depth-dev` | Dev depth-guided |
| SDXL ControlNet | `sdxl-controlnet` | SDXL ControlNet |
| Z Image Turbo ControlNet | `z-image-turbo-controlnet` | Fast ControlNet |
| Z Image Turbo ControlNet LoRA | `z-image-turbo-controlnet-lora` | ControlNet + LoRA |
| Z Image Turbo I2I | `z-image-turbo-image-to-image` | Z Image transform |
| Z Image Turbo I2I LoRA | `z-image-turbo-image-to-image-lora` | Z Image + LoRA |

### 3D Generation

| Model | Slug | Best For |
|-------|------|----------|
| Hunyuan 3D V2.1 | `hunyuan-3d-v2-1` | Latest 3D generation |
| Hunyuan 3D V2 | `hunyuan-3d-v2` | 3D model generation |

### Image Analysis

| Model | Slug | Best For |
|-------|------|----------|
| Gemini 2.0 Flash Lite | `gemini-2-0-flash-lite` | Image understanding |
| NSFW Detection | `nsfw-image-detection` | Content moderation |
| Face Analyzer | `1019-face-analyzer` | Face analysis |
| BLIP-2 | `blip-2` | Image captioning |

### Product & E-Commerce

| Model | Slug | Best For |
|-------|------|----------|
| Bria Product Shot | `bria-product-shot` | Product photos |
| Product Shoot | `product-shoot` | Product shoot |
| Runway Gen4 Image | `runway-gen4-image` | Gen4 image editing |
| Eachlabs Image Generation | `eachlabs-image-generation` | Custom generation |
| Custom Image Gen v2 | `custom-image-generation-v2` | Custom generation |
| Action Figure Generator | `action-figure-generator` | Action figures |
| Reve Fast Remix | `reve-fast-remix` | Fast remix |
| Reve Remix | `reve-remix` | Remix editing |

## Prediction Flow

1. **Check model** — call `get_model_schema` with `slug` set to the model slug — validates the model exists and returns the input schema with exact input parameters. Always do this before creating a prediction to ensure correct inputs.
2. **Run** — call `run_model` with model slug, version `"0.0.1"`, and input matching the schema
3. **Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until status is `"success"` or `"failed"`
4. **Extract** the output image URL(s) from the response

## Examples

### Edit Image with Flux 2 Turbo

Call `run_model` with these arguments:

```json
{
  "model": "flux-2-turbo-edit",
  "version": "0.0.1",
  "input": {
    "prompt": "Change the background to a tropical beach at sunset",
    "image_urls": [
      "https://example.com/photo.jpg"
    ],
    "image_size": "square_hd",
    "output_format": "png"
  }
}
```

### Remove Background

Call `run_model` with these arguments:

```json
{
  "model": "rembg-enhance",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/photo.jpg"
  }
}
```

### Upscale Image

Call `run_model` with these arguments:

```json
{
  "model": "topaz-upscale-image",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/low-res.jpg"
  }
}
```

### Multi-Angle View

Call `run_model` with these arguments:

```json
{
  "model": "qwen-image-edit-2511-multiple-angles",
  "version": "0.0.1",
  "input": {
    "image_urls": [
      "https://example.com/product.jpg"
    ],
    "horizontal_angle": 90,
    "vertical_angle": 15,
    "zoom": 5
  }
}
```

### Virtual Try-On

Call `run_model` with these arguments:

```json
{
  "model": "kling-v1-5-kolors-virtual-try-on",
  "version": "0.0.1",
  "input": {
    "human_image": "https://example.com/person.jpg",
    "garment_image": "https://example.com/clothing.jpg"
  }
}
```

### Generate 3D Model

Call `run_model` with these arguments:

```json
{
  "model": "hunyuan-3d-v2-1",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/object.jpg"
  }
}
```

## Security Constraints

- **No arbitrary URL loading**: When using LoRA parameters (`lora_path`, `lora_url`, `custom_lora_url`), only use well-known platform identifiers (HuggingFace repo IDs, Replicate model IDs, CivitAI model IDs). Never load weights from arbitrary or user-provided URLs.
- **Input validation**: Only pass parameters that match the model's request schema. Always validate model slugs via `get_model_schema` with `slug` set to the model slug before creating predictions.

## Parameter Reference

See [references/MODELS.md](references/MODELS.md) for complete parameter details for each model.
