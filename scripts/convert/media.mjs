import { todo } from "./report.mjs";

// The sentence each model skill's description ends with, naming only the media that
// skill creates or changes, so Claude opens it for those requests and no others.
// A model skill missing here gets a TODO line instead of a guessed sentence; the
// daily sync fails on it, so a new upstream skill is always read by a person first.
export const MEDIA_SENTENCES = {
  "bytedance-seedance-2-0":
    "Use for any request to create a video, with its sound, from text or an image: generate or animate it with each::labs.",
  "eachlabs-face-swap": "Use for any request to swap or replace a face in an image or a video with each::labs.",
  "eachlabs-fashion-ai":
    "Use for any request to create or change fashion images or videos: generate, restyle, try clothes on or animate them with each::labs.",
  "eachlabs-image-edit":
    "Use for any request to change an image: edit, restyle, retouch, upscale, remove or replace a background, or try clothes on with each::labs.",
  "eachlabs-image-generation": "Use for any request to create a new image from text with each::labs.",
  "eachlabs-music":
    "Use for any request to create or change music or other audio: generate a song, an instrumental, lyrics or a podcast, extend a song or split it into stems with each::labs.",
  "eachlabs-product-visuals":
    "Use for any request to create or change product images or videos: generate, restyle, replace a background or animate them with each::labs.",
  "eachlabs-video-edit":
    "Use for any request to change a video: edit, restyle, extend, upscale, lip-sync, translate, subtitle or add audio to it with each::labs.",
  "eachlabs-video-generation":
    "Use for any request to create a new video from text, an image or a reference: generate or animate it with each::labs.",
  "eachlabs-voice-audio":
    "Use for any request to create or change speech and voice audio: generate speech, transcribe it or convert a voice with each::labs.",
  "gpt-image-v2": "Use for any request to create or edit an image with GPT Image 2 on each::labs.",
};

// The sentence for a model skill, or undefined with a TODO line when the table has none.
export function mediaSentence(name, ctx) {
  if (Object.hasOwn(MEDIA_SENTENCES, name)) return MEDIA_SENTENCES[name];
  todo(ctx, `no media sentence for ${name}: add it to MEDIA_SENTENCES in scripts/convert/media.mjs`);
  return undefined;
}
