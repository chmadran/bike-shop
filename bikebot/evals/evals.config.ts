import { defineEvalConfig } from "eve/evals";

// Run-wide defaults.  Individual evals can override timeoutMs.
// Judge model is intentionally omitted here — none of the current evals
// require LLM-as-judge.  Add a `judge` key (using @ai-sdk/openai) when you
// add t.judge.autoevals.* assertions.
export default defineEvalConfig({
  maxConcurrency: 4,
  timeoutMs: 30_000,
});
