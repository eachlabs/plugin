import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { parseCurl, splitCommands } from "../curl.mjs";
import { convertCommandBlock, convertCurl } from "../endpoints.mjs";
import { buildFrontmatter, descriptionValue } from "../markdown.mjs";
import { MEDIA_SENTENCES, mediaSentence } from "../media.mjs";
import { applySkillRewrites } from "../rewrites.mjs";
import { newCtx } from "./helpers.mjs";

describe("parseCurl", () => {
  test("defaults to GET and reads the URL", () => {
    assert.deepEqual(parseCurl("curl https://api.eachlabs.ai/v1/prediction/abc"), {
      method: "GET",
      url: "https://api.eachlabs.ai/v1/prediction/abc",
      body: null,
      bodyRaw: null,
    });
  });

  test("reads -X, a multi-line command and a JSON body", () => {
    const cmd = 'curl -X POST https://api.eachlabs.ai/v1/prediction \\\n  -H "X-API-Key: k" \\\n  -d \'{\n  "model": "m",\n  "input": {"a": 1}\n}\'';
    const { method, url, body } = parseCurl(cmd);
    assert.equal(method, "POST");
    assert.equal(url, "https://api.eachlabs.ai/v1/prediction");
    assert.deepEqual(body, { model: "m", input: { a: 1 } });
  });

  test("keeps a body that is not JSON as text", () => {
    const { body, bodyRaw } = parseCurl("curl -X POST https://x.test/a -d 'not json'");
    assert.equal(body, null);
    assert.equal(bodyRaw, "not json");
  });
});

describe("splitCommands", () => {
  test("joins backslash lines and a quoted body, and keeps comments and other lines apart", () => {
    const parts = splitCommands(["# first", "curl -X POST https://x.test \\", "  -d '{", '  "a": 1', "}'", "echo hi"]);
    assert.deepEqual(parts.map((p) => p.kind), ["comment", "curl", "other"]);
    assert.equal(parts[0].text, "first");
    assert.equal(parts[1].text.split("\n").length, 4);
  });
});

describe("convertCurl: the endpoint table", () => {
  const cases = [
    ['curl -X POST https://api.eachlabs.ai/v1/prediction -d \'{"model": "m", "input": {}}\'', /^Call `run_model`/],
    ["curl https://api.eachlabs.ai/v1/prediction/abc", /^Call `get_job`/],
    ["curl https://api.eachlabs.ai/v1/model?slug=flux%2D2", /`get_model_schema` with `slug` `"flux-2"`/],
    ["curl -X POST https://api.eachlabs.ai/v1/workflows/trigger/wf/v1 -d '{\"inputs\": {}}'", /^Call `trigger_workflow`/],
    ["curl https://api.eachlabs.ai/v1/workflows/executions/ex", /^Call `get_workflow_execution`/],
    ["curl https://api.eachlabs.ai/v1/workflows/wf", /^Call `get_workflow`/],
    ["curl -X POST https://workflows.eachlabs.run/api/v1/wf/trigger -d '{\"version_id\": \"v3\"}'", /^Call `trigger_workflow`/],
    ["curl https://workflows.eachlabs.run/api/v1/executions/ex", /^Call `get_workflow_execution`/],
  ];
  for (const [cmd, expected] of cases) {
    test(cmd.slice(0, 70), () => {
      const ctx = newCtx();
      assert.match(convertCurl(cmd, ctx)[0], expected);
      assert.deepEqual(ctx.todos, []);
    });
  }

  test("the version comes from the path on api.eachlabs.ai and from the body on the legacy host", () => {
    const fromPath = convertCurl("curl -X POST https://api.eachlabs.ai/v1/workflows/trigger/wf/v7 -d '{\"inputs\": {}}'", newCtx());
    const fromBody = convertCurl("curl -X POST https://workflows.eachlabs.run/api/v1/wf/trigger -d '{\"version_id\": \"v3\"}'", newCtx());
    assert.equal(JSON.parse(fromPath.slice(3, -1).join("\n")).version_id, "v7");
    assert.equal(JSON.parse(fromBody.slice(3, -1).join("\n")).version_id, "v3");
  });

  test("a path no row matches becomes one TODO line, on a known and an unknown host", () => {
    for (const url of ["https://api.eachlabs.ai/v1/new/route", "https://workflows.eachlabs.run/api/v1/categories", "https://other.test/x"]) {
      const ctx = newCtx();
      assert.deepEqual(convertCurl(`curl ${url}`, ctx), [`TODO(contract): no tool for GET ${url}`]);
      assert.equal(ctx.todos.length, 1);
    }
  });

  test("an each::sense call is named as one", () => {
    const ctx = newCtx();
    assert.match(convertCurl("curl -X POST https://eachsense-agent.x/v1/chat/completions", ctx)[0], /each::sense call POST/);
  });

  test("a block without curl is kept as it is", () => {
    assert.equal(convertCommandBlock(['{"a": 1}'], newCtx()), null);
  });
});

describe("applySkillRewrites: anchors", () => {
  test("a missing anchor leaves the text alone and adds the note the daily job greps for", () => {
    const ctx = newCtx();
    const text = "Nothing the workflows rewrites look for.\n";
    assert.equal(applySkillRewrites(text, "eachlabs-workflows", ctx), text);
    assert.ok(ctx.notes.length > 0);
    assert.ok(ctx.notes.every((n) => n.includes("rewrite anchor not found exactly once")));
  });

  test("an anchor found once is replaced, and a skill with no rewrites is untouched", () => {
    const ctx = newCtx();
    const out = applySkillRewrites("### Step 3: Poll for Result\n", "eachlabs-workflows", ctx);
    assert.match(out, /### Step 3: Read the Result/);
    assert.equal(applySkillRewrites("### Step 3: Poll for Result\n", "other-skill", newCtx()), "### Step 3: Poll for Result\n");
  });

  test("an anchor found twice counts as not found", () => {
    const ctx = newCtx();
    const text = "### Step 3: Poll for Result\n### Step 3: Poll for Result\n";
    assert.equal(applySkillRewrites(text, "eachlabs-workflows", ctx).includes("Read the Result"), false);
  });
});

describe("buildFrontmatter: the media sentence", () => {
  const fm = "name: eachlabs-image-edit\ndescription: Edit images.\nmetadata:\n  author: x";
  test("appends the sentence to a plain description", () => {
    assert.equal(
      buildFrontmatter(fm, "eachlabs-image-edit", undefined, "Use it for media."),
      '---\nname: eachlabs-image-edit\ndescription: "Edit images. Use it for media."\n---\n'
    );
  });
  test("an override replaces the description and takes no sentence", () => {
    assert.match(buildFrontmatter(fm, "eachlabs-image-edit", "Run workflows.", "Use it."), /description: "Run workflows\."\n/);
  });
  test("quotes a description holding a colon, a hash or quotes", () => {
    const tricky = 'name: x\ndescription: Supports: text-to-video #1 and "quotes"';
    assert.equal(
      buildFrontmatter(tricky, "x", undefined, "Use it."),
      '---\nname: x\ndescription: "Supports: text-to-video #1 and \\"quotes\\" Use it."\n---\n'
    );
  });
});

describe("descriptionValue: the text of the source line", () => {
  test("reads plain, double-quoted and single-quoted values", () => {
    assert.equal(descriptionValue("description: Edit images.  "), "Edit images.");
    assert.equal(descriptionValue('description: "Say \\"hi\\": now"'), 'Say "hi": now');
    assert.equal(descriptionValue("description: 'It''s: here'"), "It's: here");
  });
});

describe("mediaSentence: the per-skill table", () => {
  test("returns the skill's own sentence", () => {
    const ctx = newCtx();
    assert.equal(mediaSentence("eachlabs-music", ctx), MEDIA_SENTENCES["eachlabs-music"]);
    assert.deepEqual(ctx.todos, []);
  });
  test("a skill missing from the table gets no sentence and a TODO line", () => {
    const ctx = newCtx();
    assert.equal(mediaSentence("new-upstream-skill", ctx), undefined);
    assert.equal(ctx.todos.length, 1);
    assert.match(ctx.todos[0], /no media sentence for new-upstream-skill/);
  });
  test("no sentence names media its skill does not handle", () => {
    assert.doesNotMatch(MEDIA_SENTENCES["eachlabs-music"], /image|video|crop/);
    assert.doesNotMatch(MEDIA_SENTENCES["eachlabs-voice-audio"], /image|video|crop/);
    for (const s of ["eachlabs-image-generation", "eachlabs-image-edit", "gpt-image-v2"]) {
      assert.doesNotMatch(MEDIA_SENTENCES[s], /video|audio|music|voice/);
    }
  });
});
