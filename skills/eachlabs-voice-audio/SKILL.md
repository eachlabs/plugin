---
name: eachlabs-voice-audio
description: Text-to-speech, speech-to-text, voice conversion, and audio processing using EachLabs AI models. Supports ElevenLabs TTS, Whisper transcription with diarization, and RVC voice conversion. Use when the user needs TTS, transcription, or voice conversion. Use for any request to create or change speech and voice audio: generate speech, transcribe it or convert a voice with each::labs.
---

# EachLabs Voice & Audio

Text-to-speech, speech-to-text transcription, voice conversion, and audio utilities via the EachLabs Predictions API.

## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

| Tool | Arguments and result |
| --- | --- |
| `get_model_schema` | `slug`; the model's input schema |
| `run_model` | `model`, `version` (`"0.0.1"`), `input`, `count`; runs the model and waits for it. When the person asks for several variants of one prompt, make one call: set the model's own count parameter (`num_images`, `num_outputs`, `n`, `number_of_images`, `batch_size`, `num_samples`, whatever `get_model_schema` shows) when it has one, otherwise set `count` to the number asked for (up to 8). Never call `run_model` once per variant: each call shows its own result card, and the picker only appears when the variants arrive together |
| `get_job` | `prediction_id`; the prediction with its status and output |
| `request_file` | `prompt` saying what to upload, `accept` (`"video"`, `"audio"`), `count` (the number of files the person mentioned), `max` (the most files the model takes for that input: the array's `maxItems` in `get_model_schema`, or the video tool's input limit); shows an upload card in the conversation and returns a `receipt_url`. Call it as soon as the model needs a file the person has not given as a URL; do not ask for a URL first, and mention that a URL works too. Then call `wait_for_upload` with the `receipt_url` right away: it returns each file's name, kind and `public_url` once the upload is done, and the `public_url` is the input URL. If it answers `waiting`, call it again. When a model takes files with different roles (a person and a garment, a source face and a target), show one card per role so each URL is unambiguous; otherwise one card takes the whole set, for example all the images of a slideshow |
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

## Available Models

### Text-to-Speech

| Model | Slug | Best For |
|-------|------|----------|
| ElevenLabs TTS | `elevenlabs-text-to-speech` | High quality TTS |
| ElevenLabs TTS w/ Timestamps | `elevenlabs-text-to-speech-with-timestamp` | TTS with word timing |
| ElevenLabs Text to Dialogue | `elevenlabs-text-to-dialogue` | Multi-speaker dialogue |
| ElevenLabs Sound Effects | `elevenlabs-sound-effects` | Sound effect generation |
| ElevenLabs Voice Design v2 | `elevenlabs-voice-design-v2` | Custom voice design |
| Kling V1 TTS | `kling-v1-tts` | Kling text-to-speech |
| Kokoro 82M | `kokoro-82m` | Lightweight TTS |
| Play AI Dialog | `play-ai-text-to-speech-dialog` | Dialog TTS |
| Stable Audio 2.5 | `stable-audio-2-5-text-to-audio` | Text to audio |

### Speech-to-Text

| Model | Slug | Best For |
|-------|------|----------|
| ElevenLabs Scribe v2 | `elevenlabs-speech-to-text-scribe-v2` | Best quality transcription |
| ElevenLabs STT | `elevenlabs-speech-to-text` | Standard transcription |
| Wizper with Timestamp | `wizper-with-timestamp` | Timestamped transcription |
| Wizper | `wizper` | Basic transcription |
| Whisper | `whisper` | Open-source transcription |
| Whisper Diarization | `whisper-diarization` | Speaker identification |
| Incredibly Fast Whisper | `incredibly-fast-whisper` | Fastest transcription |

### Voice Conversion & Cloning

| Model | Slug | Best For |
|-------|------|----------|
| RVC v2 | `rvc-v2` | Voice conversion |
| Train RVC | `train-rvc` | Train custom voice model |
| ElevenLabs Voice Clone | `elevenlabs-voice-clone` | Voice cloning |
| ElevenLabs Voice Changer | `elevenlabs-voice-changer` | Voice transformation |
| ElevenLabs Voice Design v3 | `elevenlabs-voice-design-v3` | Advanced voice design |
| ElevenLabs Dubbing | `elevenlabs-dubbing` | Video dubbing |
| Chatterbox S2S | `chatterbox-speech-to-speech` | Speech to speech |
| Open Voice | `openvoice` | Open-source voice clone |
| XTTS v2 | `xtts-v2` | Multi-language voice clone |
| Stable Audio 2.5 Inpaint | `stable-audio-2-5-inpaint` | Audio inpainting |
| Stable Audio 2.5 A2A | `stable-audio-2-5-audio-to-audio` | Audio transformation |
| Audio Trimmer | `audio-trimmer-with-fade` | Audio trimming with fade |

### Audio Utilities

| Model | Slug | Best For |
|-------|------|----------|
| FFmpeg Merge Audio Video | `ffmpeg-api-merge-audio-video` | Merge audio with video |
| Toolkit Video Convert | `toolkit` | Video/audio conversion |

## Prediction Flow

1. **Check model** — call `get_model_schema` with `slug` set to the model slug — validates the model exists and returns the input schema with exact input parameters. Always do this before creating a prediction to ensure correct inputs.
2. **Run** — call `run_model` with model slug, version `"0.0.1"`, and input matching the schema
3. **Wait** — if `run_model` returned `status` `running`, call `get_job` with the `prediction_id` until status is `"success"` or `"failed"`
4. **Extract** the output from the response

## Examples

### Text-to-Speech with ElevenLabs

Call `run_model` with these arguments:

```json
{
  "model": "elevenlabs-text-to-speech",
  "version": "0.0.1",
  "input": {
    "text": "Welcome to our product demo. Today we will walk through the key features.",
    "voice_id": "EXAVITQu4vr4xnSDxMaL",
    "model_id": "eleven_v3",
    "stability": 0.5,
    "similarity_boost": 0.7
  }
}
```

### Transcription with ElevenLabs Scribe

Call `run_model` with these arguments:

```json
{
  "model": "elevenlabs-speech-to-text-scribe-v2",
  "version": "0.0.1",
  "input": {
    "media_url": "https://example.com/recording.mp3",
    "diarize": true,
    "timestamps_granularity": "word"
  }
}
```

### Transcription with Wizper (Whisper)

Call `run_model` with these arguments:

```json
{
  "model": "wizper-with-timestamp",
  "version": "0.0.1",
  "input": {
    "audio_url": "https://example.com/audio.mp3",
    "language": "en",
    "task": "transcribe",
    "chunk_level": "segment"
  }
}
```

### Speaker Diarization with Whisper

Call `run_model` with these arguments:

```json
{
  "model": "whisper-diarization",
  "version": "0.0.1",
  "input": {
    "file_url": "https://example.com/meeting.mp3",
    "num_speakers": 3,
    "language": "en",
    "group_segments": true
  }
}
```

### Voice Conversion with RVC v2

Call `run_model` with these arguments:

```json
{
  "model": "rvc-v2",
  "version": "0.0.1",
  "input": {
    "input_audio": "https://example.com/vocals.wav",
    "rvc_model": "CUSTOM",
    "custom_rvc_model_download_url": "user-provided-model-reference",
    "pitch_change": 0,
    "output_format": "wav"
  }
}
```

### Merge Audio with Video

Call `run_model` with these arguments:

```json
{
  "model": "ffmpeg-api-merge-audio-video",
  "version": "0.0.1",
  "input": {
    "video_url": "https://example.com/video.mp4",
    "audio_url": "https://example.com/narration.mp3",
    "start_offset": 0
  }
}
```

## ElevenLabs Voice IDs

The `elevenlabs-text-to-speech` model supports these voice IDs. Pass the raw ID string:

| Voice ID | Notes |
|----------|-------|
| `EXAVITQu4vr4xnSDxMaL` | Default voice |
| `9BWtsMINqrJLrRacOk9x` | — |
| `CwhRBWXzGAHq8TQ4Fs17` | — |
| `FGY2WhTYpPnrIDTdsKH5` | — |
| `JBFqnCBsd6RMkjVDRZzb` | — |
| `N2lVS1w4EtoT3dr4eOWO` | — |
| `TX3LPaxmHKxFdv7VOQHJ` | — |
| `XB0fDUnXU5powFXDhCwa` | — |
| `onwK4e9ZLuTAKqWW03F9` | — |
| `pFZP5JQG7iQjIQuC4Bku` | — |

## Security Constraints

- **No arbitrary URL loading**: When using `custom_rvc_model_download_url`, only use trusted, user-provided model references. Never fetch models from arbitrary or untrusted URLs.
- **Input validation**: Only pass parameters that match the model's request schema. Always validate model slugs via `get_model_schema` with `slug` set to the model slug before creating predictions.

## Parameter Reference

See [references/MODELS.md](references/MODELS.md) for complete parameter details for each model.
