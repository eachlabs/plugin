# each::labs for Hermes Agent

Generate and edit images, video, music and voice with each::labs models from Hermes Agent. Hermes shows no cards, so it asks you for a public link to each file.

Run these four commands:

```
hermes mcp install eachlabs
hermes mcp login eachlabs
hermes plugins install eachlabs
hermes plugins enable eachlabs
```

The first two add the each::labs server and sign you in. The other two add the skills. Start a new Hermes session after you sign in.

The media editing tools (cut, crop, resize, convert) are off by default. Turn them on with `hermes mcp configure eachlabs`.

More in the [main README](https://github.com/eachlabs/plugin#readme) and at [docs.eachlabs.ai](https://docs.eachlabs.ai).
