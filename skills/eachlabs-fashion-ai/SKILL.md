---
name: eachlabs-fashion-ai
description: Generate fashion model imagery, virtual try-on, runway videos, and campaign visuals using EachLabs AI. Use when the user needs fashion content, model photography, or virtual try-on. Use for any request to create or change fashion images or videos: generate, restyle, try clothes on or animate them with each::labs.
---

# EachLabs Fashion AI

Generate AI fashion model imagery, virtual try-on experiences, runway content, and campaign visuals using EachLabs models.

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

| Tool | Arguments and result |
| --- | --- |
| `get_model_schema` | `slug`; the model's input schema |
| `run_model` | `model`, `version` (`"0.0.1"`), `input`, `count`; runs the model and waits for it. When the person asks for several variants of one prompt, make one call: set the model's own count parameter (`num_images`, `num_outputs`, `n`, `number_of_images`, `batch_size`, `num_samples`, whatever `get_model_schema` shows) when it has one, otherwise set `count` to the number asked for (up to 8). Never call `run_model` once per variant: each call shows its own result card, and the picker only appears when the variants arrive together |
| `get_job` | `prediction_id`; the prediction with its status and output |
| `request_file` | `prompt` saying what to upload, `accept` (`"image"`, `"video"`), `count` (the number of files the person mentioned), `max` (the most files the model takes for that input: the array's `maxItems` in `get_model_schema`, or the video tool's input limit); shows an upload card in the conversation and returns a `receipt_url`. Call it as soon as the model needs a file the person has not given as a URL; do not ask for a URL first, and mention that a URL works too. Then call `wait_for_upload` with the `receipt_url` right away: it returns each file's name, kind and `public_url` once the upload is done, and the `public_url` is the input URL. If it answers `waiting`, call it again. When a model takes files with different roles (a person and a garment, a source face and a target), show one card per role so each URL is unambiguous; otherwise one card takes the whole set, for example all the images of a slideshow |
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

### Image Generation & Editing

| Task | Model | Slug |
|------|-------|------|
| Fashion model generation | GPT Image v1.5 | `gpt-image-v1-5-text-to-image` |
| Virtual try-on (best) | Kolors Virtual Try-On | `kling-v1-5-kolors-virtual-try-on` |
| Virtual try-on (alt) | IDM VTON | `idm-vton` |
| Garment on model | Wan v2.6 Image-to-Image | `wan-v2-6-image-to-image` |
| Model photoshoot | Product Photo to Modelshoot | `product-photo-to-modelshoot` |
| Photoshoot styling | Nano Banana Pro Photoshoot | `nano-banana-pro-photoshoot` |
| Face/look consistency | Omni Zero | `omni-zero` |
| Character consistency | Ideogram Character | `ideogram-character` |
| Photomaker | Photomaker | `photomaker` |
| Photomaker Style | Photomaker Style | `photomaker-style` |
| Avatar generation | Instant ID | `instant-id` |
| Soul styling | Higgsfield AI Soul | `higgsfield-ai-soul` |
| Become image | Become Image | `become-image` |

### Training

| Task | Model | Slug |
|------|-------|------|
| Brand style training | Z Image Trainer | `z-image-trainer` |
| Portrait LoRA | Flux LoRA Portrait Trainer | `flux-lora-portrait-trainer` |

### Video

| Task | Model | Slug |
|------|-------|------|
| Runway video | Pixverse v5.6 Image-to-Video | `pixverse-v5-6-image-to-video` |
| Catwalk animation | Bytedance Omnihuman v1.5 | `bytedance-omnihuman-v1-5` |
| Motion reference | Kling v2.6 Pro Motion | `kling-v2-6-pro-motion-control` |

## Prediction Flow

1. **Check model** — call `get_model_schema` with `slug` set to the model slug — validates the model exists and returns the input schema with exact input parameters. Always do this before creating a prediction to ensure correct inputs.
2. **Run** — call `run_model` with model slug, version `"0.0.1"`, and input matching the schema
3. **Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until status is `"success"` or `"failed"`
4. **Extract** output URL from response

## Workflows

### AI Fashion Model Generation

Call `run_model` with these arguments:

```json
{
  "model": "gpt-image-v1-5-text-to-image",
  "version": "0.0.1",
  "input": {
    "prompt": "Professional fashion model wearing a tailored navy blazer, editorial photography, studio lighting, full body shot, neutral background",
    "image_size": "1024x1536",
    "quality": "high"
  }
}
```

### Virtual Try-On

Combine a garment image with a model image:

Call `run_model` with these arguments:

```json
{
  "model": "wan-v2-6-image-to-image",
  "version": "0.0.1",
  "input": {
    "prompt": "The person in image 1 wearing the clothing from image 2, professional fashion photography, editorial style",
    "image_urls": [
      "https://example.com/model.jpg",
      "https://example.com/garment.jpg"
    ],
    "image_size": "portrait_4_3"
  }
}
```

### Runway / Catwalk Video

Call `run_model` with these arguments:

```json
{
  "model": "pixverse-v5-6-image-to-video",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/fashion-model.jpg",
    "prompt": "Fashion model walking confidently on a runway, camera follows from front, professional fashion show lighting",
    "duration": "5",
    "resolution": "1080p"
  }
}
```

### Catwalk with Motion Reference

Use a real runway walk as motion reference:

Call `run_model` with these arguments:

```json
{
  "model": "kling-v2-6-pro-motion-control",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/fashion-model.jpg",
    "video_url": "https://example.com/runway-walk-reference.mp4",
    "character_orientation": "video"
  }
}
```

### Brand Style Training

Train a LoRA on your brand's visual style for consistent campaign imagery:

Call `run_model` with these arguments:

```json
{
  "model": "z-image-trainer",
  "version": "0.0.1",
  "input": {
    "image_data_url": "https://example.com/brand-photos.zip",
    "default_caption": "brand editorial fashion photography style",
    "training_type": "style",
    "steps": 1500
  }
}
```

## Prompt Tips for Fashion

- Specify pose: "full body shot", "half body", "close-up on garment details"
- Include lighting: "editorial studio lighting", "natural light", "dramatic side lighting"
- Mention style: "editorial", "street style", "haute couture", "casual lookbook"
- For diversity: specify body types, skin tones, and ages in prompts
- For consistency: use the same style keywords across a campaign series

## Parameter Reference

See the [eachlabs-image-generation](../eachlabs-image-generation/references/MODELS.md) and [eachlabs-video-generation](../eachlabs-video-generation/references/MODELS.md) references for complete model parameters.
