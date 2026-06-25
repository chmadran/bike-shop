export const MAX_MESSAGE_LENGTH = 2_000

export const CHAT_ERROR_MESSAGE =
  "Sorry — I couldn't get a reply. This can happen after a dev server restart. Try again later."

export const FIRST_CHAT_PLACEHOLDER = 'Can you help me find my new bike ?'

/** Rough token estimates for the internals panel and session cost. */
export const CHAT_CTX = {
  instructions: 210,
  toolSearchFaq: 105,
  toolGetCatalog: 90,
  toolCheckStock: 80,
  skillFaqGuide: 360,
  skillPurchaseAdvisor: 420,
} as const

export const CHAT_BASE_TOKENS =
  CHAT_CTX.instructions +
  CHAT_CTX.toolSearchFaq +
  CHAT_CTX.toolGetCatalog +
  CHAT_CTX.toolCheckStock

export function normalizeChatMessage(raw: FormDataEntryValue | null): string {
  return String(raw ?? '').trim().slice(0, MAX_MESSAGE_LENGTH)
}
