import type { StoredSession } from '@/lib/chat-types'

const STORAGE_KEY = 'vs_sessions'
const MAX_SESSIONS = 20

export function loadChatSessions(): StoredSession[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as StoredSession[]
  } catch {
    return []
  }
}

export function persistChatSessions(sessions: StoredSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 172_800_000) return 'yesterday'
  return `${Math.floor(diff / 86_400_000)}d ago`
}
