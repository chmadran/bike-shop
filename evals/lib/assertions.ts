import type { Assertion } from 'eve/evals'

function makeAssertion(config: {
  name: string
  severity: Assertion['severity']
  threshold?: number
  score: (value: unknown) => number | Promise<number>
}): Assertion {
  return {
    name: config.name,
    severity: config.severity,
    threshold: config.threshold,
    score: config.score,
    gate(threshold?: number) {
      return makeAssertion({ ...config, severity: 'gate', threshold })
    },
    soft(threshold?: number) {
      return makeAssertion({ ...config, severity: 'soft', threshold })
    },
    atLeast(threshold: number) {
      return makeAssertion({ ...config, severity: 'soft', threshold })
    },
  }
}

/** Passes when the reply does not contain the substring (case-insensitive). */
export function excludes(substring: string): Assertion {
  const needle = substring.toLowerCase()
  return makeAssertion({
    name: `excludes(${substring})`,
    severity: 'gate',
    score: (value) => +!String(value ?? '').toLowerCase().includes(needle),
  })
}
