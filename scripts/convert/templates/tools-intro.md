## Tools

This skill uses the each::labs connector. Sign-in happens through the connector; no API key is needed.

In an app that shows no cards, such as Claude Code, Hermes Agent or another terminal, do not call the tools that show or wait for a card (`request_*` and `wait_for_*`): ask in the chat instead, for a public URL of each file and for the values of any settings, range, crop, workflow inputs or choice. When the person gives a file that is only on their computer, never upload it yourself, not to each::labs and not to any other service. Ask them for a public URL of the file.

| Tool | Arguments and result |
| --- | --- |
