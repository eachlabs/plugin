---
name: eachlabs-video-generation
description: Generate new videos from text prompts, images, or reference inputs using EachLabs AI models. Supports text-to-video, image-to-video, transitions, motion control, talking head, and avatar generation. Use when the user wants to create new video content. For editing existing videos, see eachlabs-video-edit. Use for any request to create a new video from text, an image or a reference: generate or animate it with each::labs.
---

# EachLabs Video Generation

Generate new videos from text prompts, images, or reference inputs using 165+ AI models via the EachLabs Predictions API. For editing existing videos (upscaling, lip sync, extension, subtitles), see the `eachlabs-video-edit` skill.

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

In an app that shows no cards, such as Claude Code or another terminal, do not call the tools that show or wait for a card (`request_*` and `wait_for_*`): ask in the chat instead, for a public URL of each file and for the values of any settings, range, crop, workflow inputs or choice.

| Tool | Arguments and result |
| --- | --- |
| `get_model_schema` | `slug`; the model's input schema |
| `run_model` | `model`, `version` (`"0.0.1"`), `input`, `count`; runs the model and waits for it. When the person asks for several variants of one prompt, make one call: set the model's own count parameter (`num_images`, `num_outputs`, `n`, `number_of_images`, `batch_size`, `num_samples`, whatever `get_model_schema` shows) when it has one, otherwise set `count` to the number asked for (up to 8). Never call `run_model` once per variant: each call shows its own result card, and the picker only appears when the variants arrive together |
| `get_job` | `prediction_id`; the prediction with its status and output |
| `request_file` | `prompt` saying what to upload, `accept` (`"image"`, `"video"`, `"audio"`), `count` (the number of files the person mentioned), `max` (the most files the model takes for that input: the array's `maxItems` in `get_model_schema`, or the video tool's input limit); shows an upload card in the conversation and returns a `receipt_url`. In an app that shows cards, call it as soon as the model needs a file the person has not given as a URL; do not ask for a URL first, and mention that a URL works too. Then call `wait_for_upload` with the `receipt_url` right away: it returns each file's name, kind and `public_url` once the upload is done, and the `public_url` is the input URL. If it answers `waiting`, call it again. When a model takes files with different roles (a person and a garment, a source face and a target), show one card per role so each URL is unambiguous; otherwise one card takes the whole set, for example all the images of a slideshow |
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

## Quick Start

### 1. Create a Prediction

Call `run_model` with these arguments:

```json
{
  "model": "pixverse-v5-6-text-to-video",
  "version": "0.0.1",
  "input": {
    "prompt": "A golden retriever running through a meadow at sunset, cinematic slow motion",
    "resolution": "720p",
    "duration": "5",
    "aspect_ratio": "16:9"
  }
}
```

### 2. Poll for Result

Call `get_job` with `prediction_id` set to the id returned by `run_model`.

Poll until `status` is `"success"` or `"failed"`. The output video URL is in the response.

## Model Selection Guide

### Text-to-Video

| Model | Slug | Best For |
|-------|------|----------|
| Pixverse v5.6 | `pixverse-v5-6-text-to-video` | General purpose, audio generation |
| XAI Grok Imagine | `xai-grok-imagine-text-to-video` | Fast creative |
| Kandinsky 5 Pro | `kandinsky5-pro-text-to-video` | Artistic, high quality |
| Seedance v1.5 Pro | `seedance-v1-5-pro-text-to-video` | Cinematic quality |
| Seedance 2.0 Fast | `bytedance-seedance-2-0-text-to-video-fast` | Native synchronized audio, 4–15s, 480p/720p |
| Wan v2.6 | `wan-v2-6-text-to-video` | Long/narrative content |
| Kling v2.6 Pro | `kling-v2-6-pro-text-to-video` | Motion control |
| Pika v2.2 | `pika-v2-2-text-to-video` | Stylized, effects |
| Minimax Hailuo V2.3 Pro | `minimax-hailuo-v2-3-pro-text-to-video` | High fidelity |
| Sora 2 Pro | `sora-2-text-to-video-pro` | Premium quality |
| Veo 3 | `veo-3` | Google's best quality |
| Veo 3.1 | `veo3-1-text-to-video` | Latest Google model |
| LTX v2 Fast | `ltx-v-2-text-to-video-fast` | Fastest generation |
| Moonvalley Marey | `moonvalley-marey-text-to-video` | Cinematic style |
| Ovi | `ovi-text-to-video` | General purpose |

### Image-to-Video

| Model | Slug | Best For |
|-------|------|----------|
| Pixverse v5.6 | `pixverse-v5-6-image-to-video` | General purpose |
| XAI Grok Imagine | `xai-grok-imagine-image-to-video` | Creative edits |
| Wan v2.6 Flash | `wan-v2-6-image-to-video-flash` | Fastest |
| Wan v2.6 | `wan-v2-6-image-to-video` | High quality |
| Seedance v1.5 Pro | `seedance-v1-5-pro-image-to-video` | Cinematic |
| Seedance 2.0 Fast | `bytedance-seedance-2-0-image-to-video-fast` | Native audio + end-frame transition, 4–15s |
| Kandinsky 5 Pro | `kandinsky5-pro-image-to-video` | Artistic |
| Kling v2.6 Pro I2V | `kling-v2-6-pro-image-to-video` | Best Kling quality |
| Kling O1 | `kling-o1-image-to-video` | Latest Kling model |
| Pika v2.2 I2V | `pika-v2-2-image-to-video` | Effects, PikaScenes |
| Minimax Hailuo V2.3 Pro | `minimax-hailuo-v2-3-pro-image-to-video` | High fidelity |
| Sora 2 I2V | `sora-2-image-to-video` | Premium quality |
| Veo 3.1 I2V | `veo3-1-image-to-video` | Google's latest |
| Runway Gen4 Turbo | `gen4-turbo` | Fast, film quality |
| Veed Fabric 1.0 | `veed-fabric-1-0` | Social media |

### Transitions & Effects

| Model | Slug | Best For |
|-------|------|----------|
| Pixverse v5.6 Transition | `pixverse-v5-6-transition` | Smooth transitions |
| Pika v2.2 PikaScenes | `pika-v2-2-pikascenes` | Scene effects |
| Pixverse v4.5 Effect | `pixverse-v4-5-effect` | Video effects |
| Veo 3.1 First Last Frame | `veo3-1-first-last-frame-to-video` | Interpolation |

### Motion Control & Animation

| Model | Slug | Best For |
|-------|------|----------|
| Kling v2.6 Pro Motion | `kling-v2-6-pro-motion-control` | Pro motion control |
| Kling v2.6 Standard Motion | `kling-v2-6-standard-motion-control` | Standard motion |
| Motion Fast | `motion-fast` | Fast motion transfer |
| Motion Video 14B | `motion-video-14b` | High quality motion |
| Wan v2.6 R2V | `wan-v2-6-reference-to-video` | Reference-based |
| Kling O1 Reference I2V | `kling-o1-reference-image-to-video` | Reference-based |

### Talking Head & Lip Sync

| Model | Slug | Best For |
|-------|------|----------|
| Bytedance Omnihuman v1.5 | `bytedance-omnihuman-v1-5` | Full body animation |
| Creatify Aurora | `creatify-aurora` | Audio-driven avatar |
| Infinitalk I2V | `infinitalk-image-to-video` | Image talking head |
| Infinitalk V2V | `infinitalk-video-to-video` | Video talking head |
| Sync Lipsync v2 Pro | `sync-lipsync-v2-pro` | Lip sync |
| Kling Avatar v2 Pro | `kling-avatar-v2-pro` | Pro avatar |
| Kling Avatar v2 Standard | `kling-avatar-v2-standard` | Standard avatar |
| Echomimic V3 | `echomimic-v3` | Face animation |
| Stable Avatar | `stable-avatar` | Stable talking head |

## Prediction Flow

1. **Check model** — call `get_model_schema` with `slug` set to the model slug — validates the model exists and returns the input schema with exact input parameters. Always do this before creating a prediction to ensure correct inputs.
2. **Run** — call `run_model` with model slug, version `"0.0.1"`, and input parameters matching the schema
3. **Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until status is `"success"` or `"failed"`
4. **Extract** the output video URL from the response

## Examples

### Image-to-Video with Wan v2.6 Flash

Call `run_model` with these arguments:

```json
{
  "model": "wan-v2-6-image-to-video-flash",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/photo.jpg",
    "prompt": "The person turns to face the camera and smiles",
    "duration": "5",
    "resolution": "1080p"
  }
}
```

### Video Transition with Pixverse

Call `run_model` with these arguments:

```json
{
  "model": "pixverse-v5-6-transition",
  "version": "0.0.1",
  "input": {
    "prompt": "Smooth morphing transition between the two images",
    "first_image_url": "https://example.com/start.jpg",
    "end_image_url": "https://example.com/end.jpg",
    "duration": "5",
    "resolution": "720p"
  }
}
```

### Motion Control with Kling v2.6

Call `run_model` with these arguments:

```json
{
  "model": "kling-v2-6-pro-motion-control",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/character.jpg",
    "video_url": "https://example.com/dance-reference.mp4",
    "character_orientation": "video"
  }
}
```

### Talking Head with Omnihuman

Call `run_model` with these arguments:

```json
{
  "model": "bytedance-omnihuman-v1-5",
  "version": "0.0.1",
  "input": {
    "image_url": "https://example.com/portrait.jpg",
    "audio_url": "https://example.com/speech.mp3",
    "resolution": "1080p"
  }
}
```

## Prompt Tips

- Be specific about motion: "camera slowly pans left" rather than "nice camera movement"
- Include style keywords: "cinematic", "anime", "3D animation", "cyberpunk"
- Describe timing: "slow motion", "time-lapse", "fast-paced"
- For image-to-video, describe what should change from the static image
- Use negative prompts to avoid unwanted elements (where supported)

## Parameter Reference

See [references/MODELS.md](references/MODELS.md) for complete parameter details for each model.
