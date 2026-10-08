import { HOST_API, HOST_SENSE, HOST_WORKFLOWS, SENSE_PATH, WORKFLOWS_PATH } from "./endpoints.mjs";

// "model", "workflows", "deferred" (calls only each::sense) or "no-known-host".
// The workflows skill is the one named eachlabs-workflows, or one whose calls go
// to the workflow routes.
export function classify(text, name) {
  const sense = text.includes(HOST_SENSE) || text.includes(SENSE_PATH);
  const api = text.includes(HOST_API);
  const legacyWorkflows = text.includes(HOST_WORKFLOWS);
  if (!api && !legacyWorkflows) return sense ? "deferred" : "no-known-host";
  if (name === "eachlabs-workflows" || WORKFLOWS_PATH.test(text)) return "workflows";
  return legacyWorkflows && !api ? "workflows" : "model";
}
