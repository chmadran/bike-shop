import { z } from 'zod'

/**
 * Shared validation contract for chat input sent to the eve agent.
 *
 * This is the single source of truth used on BOTH sides:
 *  - the client (before POSTing, to give instant feedback)
 *  - the server boundary in `proxy.ts` (to enforce it for real)
 *
 * Note: React already escapes text when rendering, so this is NOT about XSS.
 * It is about enforcing the shape/size of input before it reaches the LLM
 * agent (preventing empty turns, oversized prompts, runaway token cost, and
 * malformed payloads).
 */

/** Maximum number of characters allowed in a single chat message. */
export const MAX_CHAT_MESSAGE_LENGTH = 2000

export const chatMessageSchema = z.object({
  message: z
    .string({ message: 'Message is required.' })
    .trim()
    .min(1, 'Please enter a message.')
    .max(
      MAX_CHAT_MESSAGE_LENGTH,
      `Message must be ${MAX_CHAT_MESSAGE_LENGTH} characters or fewer.`,
    ),
  // Opaque continuation token issued by the eve session; never trusted as input
  // beyond being a bounded string.
  continuationToken: z.string().max(4096).optional(),
})

export type ChatMessageInput = z.infer<typeof chatMessageSchema>

/**
 * Safely parse and sanitize a chat payload.
 * Returns the trimmed/validated data on success, or a flat error message.
 */
export function parseChatMessage(input: unknown):
  | { success: true; data: ChatMessageInput }
  | { success: false; error: string } {
  const result = chatMessageSchema.safeParse(input)
  if (!result.success) {
    const first = result.error.issues[0]?.message ?? 'Invalid message.'
    return { success: false, error: first }
  }
  return { success: true, data: result.data }
}
