# each::labs plugin for Claude

Generate and edit images, video, music and voice with each::labs models, and
run your organization's each::labs workflows, by asking in a conversation. The
plugin also cuts, crops, resizes and converts media, and shows small
interactive cards inside the chat where you upload a file, adjust a model's
settings or pick one of several results.

It works in Claude Chat (claude.ai), Claude Desktop, Cowork and Claude Code.
You sign in with your each::labs account; there is no API key to paste.

## Install

The plugin is installed from its own marketplace, `eachlabs/claude-plugin`.

| Where | How |
| --- | --- |
| Claude Chat, Claude Desktop | Customize, Plugins, Add marketplace, enter `eachlabs/claude-plugin`, then add the eachlabs plugin |
| Claude Code | `claude plugin marketplace add eachlabs/claude-plugin`, then `claude plugin install eachlabs@eachlabs` |

**Team and Enterprise.** An Owner can add the connector
`https://mcp.eachlabs.ai/mcp` for the whole organization. Each member adds the
plugin marketplace themselves, because organization-wide plugin sync on
claude.ai accepts only the organization's own private repositories. Each member
then signs in with their own each::labs account. That account must belong to
the each::labs organization that should pay for the runs; a member who signs in
with a personal account is billed there instead.

**Updating.** In Claude Chat and Claude Desktop a plugin installed from the
marketplace updates automatically, with no restart. In Claude Code, run
`claude plugin update eachlabs@eachlabs`, then `/reload-plugins`.

## Sign in

After installing, open the plugin's Connectors tab and choose Connect. A
browser window opens on each::labs: sign in and pick the organization to use.
Every model run and workflow run is billed to that organization, the same way
as a run from the each::labs dashboard or API.

## What to ask

Ask in your own words. Claude chooses the model, reads its inputs and runs it.
Some examples:

| Task | Example |
| --- | --- |
| Images | "Generate a product photo of a white sneaker on a marble table, soft studio light." |
| Images | "Give me 4 variants of a fantasy trading card with a fire dragon, I want to pick one." |
| Image editing | "Remove the background from this photo." "Turn this portrait into a watercolor painting." |
| Video | "Turn this image into a 5-second clip where the camera slowly pushes in." |
| Video | "Make a 10-second video of waves hitting a lighthouse at sunset." |
| Music | "Compose a 30-second upbeat lo-fi beat for an intro." |
| Voice | "Read this paragraph aloud in a calm male voice." "Transcribe this interview." |
| Cutting and cropping | "Cut the first 10 seconds of this video." "Crop this video to 9:16 for a story." |
| Converting | "Convert this clip to a GIF." "Extract the audio from this video as mp3." |
| Workflows | "Which workflows do we have?" "Run our product clip workflow with this photo." |

When a task has several steps, such as restyling a photo and then animating
it, Claude first looks for one of your organization's workflows that does the
whole job, and runs it if one fits.

## Cards in the conversation

In the chat apps, Claude Chat (claude.ai) and Claude Desktop, some answers come
with a small card instead of plain text. Terminals such as Claude Code show the
same results as text.

| You see | When |
| --- | --- |
| A file picker with "Choose a photo" and a progress bar | A model needs a file you have not linked. One card takes a whole set of files, for example all the screenshots for a slideshow. The files go from your browser straight to each::labs storage |
| A form with the model's settings and a Run button | You ask to adjust settings, or a run has options worth choosing first |
| The result: the image, a video or audio player, and download buttons | Every run that produces media. A file in several formats has one button per format. A workflow's outputs show together as a gallery |
| Several results to choose from, and a "Use this variant" button | You asked for several variants. Click between them as often as you like, then press "Use this variant"; Claude continues with that one, and the choice is final |
| A Compare button under an edited image or video | The result is an edit of a file you gave. Drag the handle to compare before and after |
| A timeline with two handles, or a rectangle on the first frame | You want to cut a clip or crop a frame and have not given exact numbers |
| A workflow's inputs as a form, with a file picker for each photo, video or audio input | A workflow needs inputs you have not given |

After you press a card's button, Claude continues on its own. You do not need
to type anything. A card you already used stays locked on your choice when you
come back to the conversation later.

After the first run of a model in a conversation, Claude ends its reply with a
short **Adjust generation settings** line naming a few of that model's
settings. Ask to change any of them and the settings form appears.

## Limits

- **each::sense skills are not included.** The public eachlabs/skills
  collection also has skills that run through each::sense, the each::labs
  agent. Access to each::sense is restricted to specific organizations, so
  this plugin does not include those skills. Most of their tasks, such as
  background removal, upscaling, trimming or watermarking, work through the
  models and video tools above.
- **Files live on each::labs storage.** Uploads and results are stored by
  each::labs and shown from there. Anyone who has a file's link can open it;
  the links are long random addresses, not listed anywhere. Files are kept for
  180 days, or for your organization's own retention period if it set one, and
  can be deleted earlier from the storage page in the each::labs dashboard.
- **Uploads.** One upload card takes up to 50 files, or fewer when the chosen
  model accepts fewer, and up to 100 MB per file. Files upload four at a time.
  A card refuses too many files or a file that is too large before anything
  uploads. The same limits apply to the file fields on a workflow's form.
- **Long jobs.** A video can take a few minutes. Claude waits for it; if a run
  takes longer than the wait, Claude checks again until it finishes.
- **Variants.** Up to 8 results of one prompt in a single request, unless the
  model itself can make more in one run.
- **Workflows.** Claude can list, read and run your organization's workflows
  and show their results. Building or editing a workflow is done in the
  each::labs dashboard.
- **Phones.** Cards work in the Claude app; the file picker opens your photo
  library, not the camera.
- **Trimming FLAC audio** returns an mp4 file, because the trim copies the
  audio without converting it. mp3, wav and m4a keep their format.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| A new card or an update does not show | Start a new conversation. If it still does not show, reload claude.ai or restart Claude Desktop |
| A card says it takes fewer files than you have | Tell Claude how many files you have, or ask for another card for the rest |
| Tools fail with a sign-in or permission error | Open the plugin's Connectors tab, disconnect, and connect again |
| A card does not appear, only text | Check you are in Claude Chat or Claude Desktop; Claude Code shows text only. Ask Claude to show the result again |
| A card says a file is no longer available | Ask Claude to show the file again; it fetches a fresh copy of the result |
| The wrong organization is billed | Disconnect the connector and sign in again, picking the right organization |

## Data

Your prompts and input file links go to the each::labs MCP server, which runs
them on the each::labs API under the organization you picked at sign-in. A file
you add on a card goes from your browser to each::labs storage and does not
pass through Claude. The plugin stores nothing itself.

## Contributing

How the repository is laid out, how the skills are generated and how a version
is released is in [CONTRIBUTING.md](CONTRIBUTING.md).
