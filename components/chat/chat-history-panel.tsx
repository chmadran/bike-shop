import { formatRelativeTime } from '@/lib/chat-sessions'
import type { StoredSession } from '@/lib/chat-types'

type ChatHistoryPanelProps = {
  sessions: StoredSession[]
  activeKey: string
  onOpen: (session: StoredSession) => void
  onDelete: (key: string) => void
  onNew: () => void
}

export function ChatHistoryPanel({
  sessions,
  activeKey,
  onOpen,
  onDelete,
  onNew,
}: ChatHistoryPanelProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="p-4 text-center text-xs text-muted-foreground">No past conversations yet.</p>
        ) : (
          sessions.map((s) => (
            <div
              key={s.key}
              className={`group flex items-start gap-2 border-b border-border/50 px-3 py-2.5 transition-colors hover:bg-muted/50 ${s.key === activeKey ? 'bg-muted/50' : ''}`}
            >
              <button
                onClick={() => onOpen(s)}
                className="flex flex-1 flex-col items-start gap-0.5 text-left"
              >
                <span className="line-clamp-1 text-xs font-medium text-foreground">{s.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(s.updatedAt)} · {Math.floor(s.messages.length / 2)}{' '}
                  {s.messages.length / 2 === 1 ? 'exchange' : 'exchanges'}
                </span>
              </button>
              <button
                onClick={() => onDelete(s.key)}
                className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                aria-label="Delete conversation"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
