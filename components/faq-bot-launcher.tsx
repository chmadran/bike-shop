'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Minimal eve HTTP client — avoids importing eve/react which pulls in
// Node.js built-ins (node:module) that can't be bundled for the browser.
// ---------------------------------------------------------------------------

type Message = { id: string; role: 'user' | 'assistant'; text: string }
type Status = 'idle' | 'loading' | 'streaming'

function BikeLoader() {
  return (
    <svg
      viewBox="0 0 64 32"
      className="h-5 w-10"
      aria-label="Thinking…"
    >
      {/* Rear wheel */}
      <circle cx="12" cy="22" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      {/* Front wheel */}
      <circle cx="52" cy="22" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      {/* Frame */}
      <polyline points="12,22 24,8 36,8 52,22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="24" y1="8" x2="28" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Saddle */}
      <line x1="33" y1="8" x2="40" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Handlebar */}
      <line x1="48" y1="10" x2="55" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="10" x2="52" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Animated road dots */}
      <circle cx="4"  cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_0ms]" />
      <circle cx="18" cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_150ms]" />
      <circle cx="32" cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_300ms]" />
      <circle cx="46" cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_450ms]" />
      <circle cx="60" cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_600ms]" />
    </svg>
  )
}

function useEveChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const sessionIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  // Tracks how many events we've already read so we don't replay previous turns.
  const streamIndexRef = useRef(0)

  const send = useCallback(async (text: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
    const assistantId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', text: '' },
    ])
    setStatus('loading')

    try {
      // Start or continue the session.
      const url = sessionIdRef.current
        ? `/eve/v1/session/${sessionIdRef.current}`
        : '/eve/v1/session'

      const body: Record<string, unknown> = { message: text }
      if (tokenRef.current) body.continuationToken = tokenRef.current
      body.clientContext = { mode: 'customer', locale: 'en', currency: 'GBP', region: 'UK' }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      sessionIdRef.current =
        res.headers.get('x-eve-session-id') ?? json.sessionId ?? sessionIdRef.current
      tokenRef.current = json.continuationToken ?? tokenRef.current

      // Stream only new events for this turn using startIndex.
      setStatus('streaming')
      const stream = await fetch(
        `/eve/v1/session/${sessionIdRef.current}/stream?startIndex=${streamIndexRef.current}`,
      )
      const reader = stream.body!.getReader()
      const dec = new TextDecoder()
      let buf = ''
      let done = false
      let eventsRead = 0

      while (!done) {
        const chunk = await reader.read()
        if (chunk.done) break
        buf += dec.decode(chunk.value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          eventsRead++
          try {
            const ev = JSON.parse(line) as { type: string; data?: Record<string, unknown> }
            const d = ev.data ?? {}

            if (ev.type === 'message.appended') {
              const cumulative = (d.messageSoFar as string | undefined) ?? ''
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: cumulative } : m,
                ),
              )
            } else if (ev.type === 'message.completed') {
              const msg = d.message as { parts?: { type: string; text?: string }[] } | undefined
              const final = msg?.parts
                ?.filter((p) => p.type === 'text')
                .map((p) => p.text ?? '')
                .join('') ?? ''
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId && final ? { ...m, text: final } : m,
                ),
              )
            } else if (
              ev.type === 'session.waiting' ||
              ev.type === 'session.completed' ||
              ev.type === 'session.failed' ||
              ev.type === 'turn.failed'
            ) {
              done = true
            }
          } catch {
            // skip malformed lines
          }
        }
      }
      reader.cancel()
      // Advance the cursor so the next turn starts reading after these events.
      streamIndexRef.current += eventsRead
    } catch (err) {
      console.error('[eve chat]', err)
    } finally {
      setStatus('idle')
    }
  }, [])

  return { messages, status, send }
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

export function FaqBotLauncher() {
  const [open, setOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { messages, status, send } = useEveChat()
  const isBusy = status !== 'idle'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const message = String(new FormData(form).get('message') ?? '').trim()
    if (!message || isBusy) return
    void send(message)
    form.reset()
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[32rem] max-h-[calc(100dvh-7rem)] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: 'var(--geist-blue)' }}
              />
              <span className="text-sm font-medium">FAQ Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close assistant"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ask me anything about shipping, sizing, returns, or stock availability.
              </p>
            )}

            {messages.map((msg) => {
              const isEmpty = msg.role === 'assistant' && msg.text === ''
              // Don't render the empty assistant placeholder — show the loader instead.
              if (isEmpty) return null
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <span className="whitespace-pre-wrap animate-[fadein_0.15s_ease-in]">{msg.text}</span>
                  </div>
                </div>
              )
            })}

            {isBusy && messages.at(-1)?.text === '' && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <BikeLoader />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border px-3 py-2"
          >
            <input
              name="message"
              placeholder="Ask a question…"
              disabled={isBusy}
              autoComplete="off"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isBusy}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background transition-opacity hover:opacity-80 disabled:opacity-40"
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
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
