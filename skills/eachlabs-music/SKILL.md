---
name: eachlabs-music
description: Generate songs, instrumentals, lyrics, and podcasts using EachLabs Mureka AI models. Also supports song extension, stem separation, and song recognition. Use when the user wants to create music, lyrics, or audio content. Use for any request to create or change music or other audio: generate a song, an instrumental, lyrics or a podcast, extend a song or split it into stems with each::labs.
---

# EachLabs Music

Generate songs, instrumentals, lyrics, podcasts, and more using Mureka AI models via the EachLabs Predictions API.

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

| Tool | Arguments and result |
| --- | --- |
| `get_model_schema` | `slug`; the model's input schema |
| `run_model` | `model`, `version` (`"0.0.1"`), `input`, `count`; runs the model and waits for it. When the person asks for several variants of one prompt, make one call: set the model's own count parameter (`num_images`, `num_outputs`, `n`, `number_of_images`, `batch_size`, `num_samples`, whatever `get_model_schema` shows) when it has one, otherwise set `count` to the number asked for (up to 8). Never call `run_model` once per variant: each call shows its own result card, and the picker only appears when the variants arrive together |
| `get_job` | `prediction_id`; the prediction with its status and output |
| `request_file` | `prompt` saying what to upload, `accept` (`"audio"`), `count` (the number of files the person mentioned), `max` (the most files the model takes for that input: the array's `maxItems` in `get_model_schema`, or the video tool's input limit); shows an upload card in the conversation and returns a `receipt_url`. Call it as soon as the model needs a file the person has not given as a URL; do not ask for a URL first, and mention that a URL works too. Then call `wait_for_upload` with the `receipt_url` right away: it returns each file's name, kind and `public_url` once the upload is done, and the `public_url` is the input URL. If it answers `waiting`, call it again. When a model takes files with different roles (a person and a garment, a source face and a target), show one card per role so each URL is unambiguous; otherwise one card takes the whole set, for example all the images of a slideshow |
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

## Available Capabilities

### Mureka Models

| Capability | Slug | Description |
|-----------|------|-------------|
| Generate Song | `mureka-generate-song` | Create a full song with vocals from a prompt |
| Generate Instrumental | `mureka-generate-instrumental` | Create instrumental tracks |
| Generate Lyrics | `mureka-generate-lyrics` | Generate lyrics from a prompt |
| Extend Lyrics | `mureka-extend-lyrics` | Continue/extend existing lyrics |
| Extend Song | `mureka-extend-song` | Continue an existing song |
| Create Speech | `mureka-create-speech` | Generate speech audio |
| Create Podcast | `mureka-create-podcast` | Generate multi-speaker podcast |
| Recognize Song | `mureka-recognize-song` | Identify a song from audio |
| Describe Song | `mureka-describe-song` | Analyze and describe a song |
| Stem Song | `mureka-stem-song` | Separate audio into stems |
| Upload File | `mureka-upload-file` | Upload audio for other operations |

### Minimax Music

| Capability | Slug | Description |
|-----------|------|-------------|
| Music v2 | `minimax-music-v2` | Latest Minimax music generation |
| Music v1.5 | `minimax-music-v1-5` | Stable Minimax music generation |

## Prediction Flow

1. **Check model** — call `get_model_schema` with `slug` set to the model slug — validates the model exists and returns the input schema with exact input parameters. Always do this before creating a prediction to ensure correct inputs.
2. **Run** — call `run_model` with model slug, version `"0.0.1"`, and input matching the schema
3. **Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until status is `"success"` or `"failed"`
4. **Extract** the output from the response

## Examples

### Generate a Song

Call `run_model` with these arguments:

```json
{
  "model": "mureka-generate-song",
  "version": "0.0.1",
  "input": {
    "prompt": "An upbeat indie pop song about summer road trips with catchy chorus",
    "duration": 120
  }
}
```

### Generate Instrumental

Call `run_model` with these arguments:

```json
{
  "model": "mureka-generate-instrumental",
  "version": "0.0.1",
  "input": {
    "prompt": "Lo-fi hip hop beat with jazzy piano chords and vinyl crackle, relaxing study music"
  }
}
```

### Generate Lyrics

Call `run_model` with these arguments:

```json
{
  "model": "mureka-generate-lyrics",
  "version": "0.0.1",
  "input": {
    "prompt": "Write lyrics for a heartfelt country ballad about coming home"
  }
}
```

### Create a Podcast

Call `run_model` with these arguments:

```json
{
  "model": "mureka-create-podcast",
  "version": "0.0.1",
  "input": {
    "prompt": "A 5-minute podcast discussion about the future of AI in music production",
    "speakers": [
      "Luna",
      "Jake"
    ]
  }
}
```

### Extend an Existing Song

First upload the song, then extend it:

Step 1: Upload the audio file

Call `run_model` with these arguments:

```json
{
  "model": "mureka-upload-file",
  "version": "0.0.1",
  "input": {
    "file": "https://example.com/my-song.mp3",
    "purpose": "audio"
  }
}
```

Step 2: Use the upload ID to extend the song

Call `run_model` with these arguments:

```json
{
  "model": "mureka-extend-song",
  "version": "0.0.1",
  "input": {
    "upload_audio_id": "<upload-id-from-step-1>",
    "prompt": "Continue with an energetic guitar solo bridge"
  }
}
```

### Separate Audio Stems

Call `run_model` with these arguments:

```json
{
  "model": "mureka-stem-song",
  "version": "0.0.1",
  "input": {
    "url": "https://example.com/song.mp3"
  }
}
```

## Prompt Tips

- Specify genre: "indie pop", "lo-fi hip hop", "classical orchestral", "EDM"
- Include mood: "upbeat", "melancholic", "energetic", "relaxing"
- Mention instruments: "acoustic guitar", "piano", "synthesizer", "drums"
- Describe tempo: "slow ballad", "fast-paced", "medium tempo groove"
- For lyrics, mention theme and structure: "verse-chorus-verse about..."

## Parameter Reference

See [references/MODELS.md](references/MODELS.md) for complete parameter details for each model.
