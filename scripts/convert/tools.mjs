import { template } from "./template.mjs";

// The input kinds named by a skill's example inputs decide whether it gets the
// upload card rows and which kinds they accept.
const IMAGE_INPUT_KEYS =
  /"(image_url|image_urls|first_image_url|end_image_url|human_image|garment_image|target_image|swap_image|image_data_url)"/;
const VIDEO_INPUT_KEYS = /"(video_url|media_url|target_video)": "https?:/;
const AUDIO_INPUT_KEYS = /"(audio_url|input_audio)": "https?:/;
// Generic keys say nothing about the kind; the example URL's extension does.
const GENERIC_INPUT_URLS = /"(media_url|file_url|file|url)": "(https?:[^"]+)"/g;
const EXTENSION_KINDS = [
  [/\.(jpe?g|png|webp|gif|heic)$/i, "image"],
  [/\.(mp4|mov|webm|mkv)$/i, "video"],
  [/\.(mp3|wav|m4a|ogg|flac|aac)$/i, "audio"],
];
const KINDS = ["image", "video", "audio"];

export function detectInputs(body) {
  const kinds = new Set();
  if (IMAGE_INPUT_KEYS.test(body)) kinds.add("image");
  if (VIDEO_INPUT_KEYS.test(body)) kinds.add("video");
  if (AUDIO_INPUT_KEYS.test(body)) kinds.add("audio");
  for (const [, , url] of body.matchAll(GENERIC_INPUT_URLS)) {
    const hit = EXTENSION_KINDS.find(([re]) => re.test(url));
    if (hit) kinds.add(hit[1]);
    else KINDS.forEach((k) => kinds.add(k));
  }
  return KINDS.filter((k) => kinds.has(k));
}

// The Tools section a skill gets before its first H2, as lines.
export function toolsSection(kind, uploadKinds) {
  const workflows = kind === "workflows";
  const parts = [template("tools-intro"), template(workflows ? "tools-workflows" : "tools-model")];
  if (!workflows && uploadKinds.length > 0) {
    parts.push(template("tools-upload", { accept: uploadKinds.map((k) => `\`"${k}"\``).join(", ") }));
  }
  if (!workflows) parts.push(template("tools-model-cards"));
  parts.push("", template("long-job", { getTool: workflows ? "get_workflow_execution" : "get_job" }));
  if (!workflows) parts.push("", template("compare-note"));
  parts.push("");
  return parts.join("\n").split("\n");
}
