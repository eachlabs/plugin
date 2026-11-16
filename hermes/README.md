# each::labs for Hermes Agent

Generate and edit images, video, music and voice with each::labs models from Hermes Agent. Hermes shows no cards, so it asks you for a public link to each file.

## Before you install

- Calls go to `https://mcp.eachlabs.ai/mcp`, signed in as you.
- Runs are paid. They are billed to the organization you choose at sign-in.
- Your prompts and file URLs are sent to each::labs and to the model providers it uses.
- Hermes stores and refreshes the sign-in tokens.
- This package has no code and no `mcp.json`. It only adds skills.

## Set up

```
hermes mcp add eachlabs --url https://mcp.eachlabs.ai/mcp --auth oauth --connect-timeout 300
hermes mcp login eachlabs        # only if no browser opened
hermes plugins install eachlabs
hermes plugins enable eachlabs
```

The first command adds the each::labs server and opens the sign-in page in your browser. Run the second only if no browser opened. The other two add the skills. Start a new Hermes session after you sign in.

The media editing tools (cut, crop, resize, convert) are off by default. Turn them on with `hermes mcp configure eachlabs`.

More in the [main README](https://github.com/eachlabs/plugin#readme) and at [docs.eachlabs.ai](https://docs.eachlabs.ai).
