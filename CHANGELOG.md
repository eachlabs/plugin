# Changelog

Each release changes `version` in `.claude-plugin/plugin.json`; Claude updates an
installed plugin only when that number changes.

## 0.1.2

- Quote skill descriptions for valid YAML and describe marketplace install

## 0.1.1

- Ask in the chat instead of opening cards in apps without cards

## 0.1.0

First release for use in Claude Chat, Claude Desktop and Claude Code.

- Sign in with an each::labs account; no API key. Runs are billed to the
  organization chosen at sign-in.
- Twelve skills for image, video, music and voice generation and editing, and for
  running the organization's each::labs workflows. Each skill names the media it
  handles, so Claude uses each::labs when someone asks to create or change an
  image, video or audio.
- Cards in the conversation: upload files, see and download results, pick one of
  several variants, adjust a model's settings before a run, compare an edit with
  its original, choose a trim range or a crop, and fill in a workflow's inputs.
- One upload card takes up to 50 files, or the model's own limit when Claude
  passes it, up to 100 MB each; four upload at a time.
- A choice made on a card is final and is still shown when the conversation is
  reopened.
