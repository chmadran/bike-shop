import { defineEvalConfig } from 'eve/evals'

export default defineEvalConfig({
  // Default model for t.judge i.e LM-as-judge scoring 
  // judge: { model: 'openai/gpt-4o-mini' }

  // Max evals running in parallel (default 8)
  // maxConcurrency: 2,

  // Default per-eval timeout in ms
  // timeoutMs: 120_000,

  // Send results to external tooling
  // reporters: [xxx({ projectName: 'vur-selle-bikes' })],
})
