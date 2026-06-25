'use client'

import { useRef, useEffect, useState } from 'react'
import { ChatHistoryPanel } from '@/components/chat/chat-history-panel'
import { ChatInternalsPanel } from '@/components/chat/chat-internals-panel'
import { ChatMessageThread } from '@/components/chat/chat-message-thread'
import { useEveChat } from '@/hooks/use-eve-chat'
import { loadChatSessions, persistChatSessions } from '@/lib/chat-sessions'
import type { ChatStatus, ChatView, StoredSession } from '@/lib/chat-types'

export function FaqBotLauncher() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<ChatView>('chat')
  const [sessions, setSessions] = useState<StoredSession[]>([])
  const [activeKey, setActiveKey] = useState('')
  const { messages, status, send, lastTurn, totalCostUsd, restore, snapshot, reset } = useEveChat()
  const prevStatus = useRef<ChatStatus>('idle')

  useEffect(() => {
    const stored = loadChatSessions()
    setSessions(stored)
    if (stored.length > 0) {
      setActiveKey(stored[0].key)
      restore(stored[0])
    } else {
      setActiveKey(crypto.randomUUID())
    }
  }, [restore])

  useEffect(() => {
    const wasActive = prevStatus.current !== 'idle'
    prevStatus.current = status
    if (status !== 'idle' || !wasActive || messages.length === 0) return

    const title = messages.find((m) => m.role === 'user')?.text.slice(0, 60) ?? 'New chat'
    const now = Date.now()
    setSessions((prev) => {
      const existing = prev.find((s) => s.key === activeKey)
      const updated: StoredSession = {
        key: activeKey,
        title,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        ...snapshot(messages, totalCostUsd),
      }
      const next = [updated, ...prev.filter((s) => s.key !== activeKey)]
      persistChatSessions(next)
      return next
    })
  }, [status, messages, totalCostUsd, activeKey, snapshot])

  function handleSend(message: string) {
    void send(message)
    setView('chat')
  }

  function startNewChat() {
    reset()
    setActiveKey(crypto.randomUUID())
    setView('chat')
  }

  function openSession(session: StoredSession) {
    restore(session)
    setActiveKey(session.key)
    setView('chat')
  }

  function deleteSession(key: string) {
    setSessions((prev) => {
      const next = prev.filter((s) => s.key !== key)
      persistChatSessions(next)
      if (key === activeKey) {
        reset()
        setActiveKey(crypto.randomUUID())
      }
      return next
    })
  }

  function toggleView(target: ChatView) {
    setView((v) => (v === target ? 'chat' : target))
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[calc(70dvh-6rem)] max-h-[56rem] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:w-[680px]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--geist-blue)' }} />
              <span className="text-sm font-medium">FAQ Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleView('history')}
                className={`rounded-md p-1 transition-colors ${view === 'history' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Chat history"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 4v4h4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => toggleView('internals')}
                className={`rounded-md px-2 py-1 font-mono text-xs transition-colors ${view === 'internals' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Toggle agent internals"
              >
                internals
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {view === 'internals' ? (
            <ChatInternalsPanel lastTurn={lastTurn} messages={messages} totalCostUsd={totalCostUsd} />
          ) : view === 'history' ? (
            <ChatHistoryPanel
              sessions={sessions}
              activeKey={activeKey}
              onOpen={openSession}
              onDelete={deleteSession}
              onNew={startNewChat}
            />
          ) : (
            <ChatMessageThread messages={messages} status={status} onSend={handleSend} />
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-opacity hover:opacity-90"
        aria-label="Open FAQ assistant"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.9-.9L3 21l1.9-5.6a8.5 8.5 0 01-.9-3.9A8.38 8.38 0 0112.5 3 8.38 8.38 0 0121 11.5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
