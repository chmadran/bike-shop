'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Message = { id: string; role: 'user' | 'assistant'; text: string }
type Status = 'idle' | 'loading' | 'streaming'
type View = 'chat' | 'history' | 'internals'

type TurnMeta = {
  totalMs: number
  firstTokenMs: number | null
  interTokenMs: number | null
  toolsCalled: string[]
  skillsLoaded: string[]
  eventCount: number
}

type StoredSession = {
  key: string
  title: string
  eveSessionId: string | null
  continuationToken: string | null
  streamIndex: number
  messages: Message[]
  totalCostUsd: number
  createdAt: number
  updatedAt: number
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'vs_sessions'
const MAX_SESSIONS = 20
const MAX_MESSAGE_LENGTH = 2_000

function normalizeMessage(raw: FormDataEntryValue | null): string {
  return String(raw ?? '').trim().slice(0, MAX_MESSAGE_LENGTH)
}

function loadSessions(): StoredSession[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function persistSessions(sessions: StoredSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 172_800_000) return 'yesterday'
  return `${Math.floor(diff / 86_400_000)}d ago`
}

// ---------------------------------------------------------------------------
// Context approximations (tokens)
// ---------------------------------------------------------------------------
const CTX = {
  instructions: 210,
  toolSearchFaq: 105,
  toolGetCatalog: 90,
  toolCheckStock: 80,
  skillFaqGuide: 360,
  skillPurchaseAdvisor: 420,
}
const BASE_TOKENS = CTX.instructions + CTX.toolSearchFaq + CTX.toolGetCatalog + CTX.toolCheckStock

// ---------------------------------------------------------------------------
// Bike loader
// ---------------------------------------------------------------------------
function BikeLoader() {
  return (
    <svg viewBox="0 0 64 32" className="h-5 w-10" aria-label="Thinking…">
      <circle cx="12" cy="22" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <circle cx="52" cy="22" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <polyline points="12,22 24,8 36,8 52,22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="24" y1="8" x2="28" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="33" y1="8" x2="40" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="10" x2="55" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="10" x2="52" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4"  cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_0ms]" />
      <circle cx="18" cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_150ms]" />
      <circle cx="32" cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_300ms]" />
      <circle cx="46" cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_450ms]" />
      <circle cx="60" cy="30" r="1.5" fill="currentColor" opacity="0.3" className="animate-[roadpulse_0.9s_ease-in-out_infinite_600ms]" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Eve HTTP client hook
// ---------------------------------------------------------------------------
function useEveChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [lastTurn, setLastTurn] = useState<TurnMeta | null>(null)
  const [totalCostUsd, setTotalCostUsd] = useState(0)
  const sessionIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const streamIndexRef = useRef(0)

  // Restore a stored session into the hook's state.
  const restore = useCallback((s: StoredSession) => {
    setMessages(s.messages)
    setTotalCostUsd(s.totalCostUsd)
    setLastTurn(null)
    sessionIdRef.current = s.eveSessionId
    tokenRef.current = s.continuationToken
    streamIndexRef.current = s.streamIndex
  }, [])

  // Return a snapshot of current state for persistence.
  const snapshot = useCallback(
    (msgs: Message[], cost: number): Omit<StoredSession, 'key' | 'title' | 'createdAt' | 'updatedAt'> => ({
      eveSessionId: sessionIdRef.current,
      continuationToken: tokenRef.current,
      streamIndex: streamIndexRef.current,
      messages: msgs,
      totalCostUsd: cost,
    }),
    [],
  )

  // Reset to a blank session.
  const reset = useCallback(() => {
    setMessages([])
    setTotalCostUsd(0)
    setLastTurn(null)
    sessionIdRef.current = null
    tokenRef.current = null
    streamIndexRef.current = 0
  }, [])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim().slice(0, MAX_MESSAGE_LENGTH)
    if (!trimmed) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: trimmed }
    const assistantId = crypto.randomUUID()
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '' }])
    setStatus('loading')

    const turnStart = Date.now()
    let firstTokenAt: number | null = null
    let lastTokenAt: number | null = null
    let appendedCount = 0
    const toolsCalled: string[] = []
    const skillsLoaded: string[] = []

    try {
      const url = sessionIdRef.current
        ? `/eve/v1/session/${sessionIdRef.current}`
        : '/eve/v1/session'

      const body: Record<string, unknown> = { message: trimmed }
      if (tokenRef.current) body.continuationToken = tokenRef.current

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      sessionIdRef.current =
        res.headers.get('x-eve-session-id') ?? json.sessionId ?? sessionIdRef.current
      tokenRef.current = json.continuationToken ?? tokenRef.current

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
              const now = Date.now()
              if (firstTokenAt === null) firstTokenAt = now
              lastTokenAt = now
              appendedCount++
              const cumulative = (d.messageSoFar as string | undefined) ?? ''
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, text: cumulative } : m)),
              )
            } else if (ev.type === 'message.completed') {
              const msg = d.message as { parts?: { type: string; text?: string }[] } | undefined
              const final = msg?.parts?.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('') ?? ''
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId && final ? { ...m, text: final } : m)),
              )
            } else if (ev.type === 'tool.started' || ev.type === 'turn.tool_called') {
              const name = (d.toolName ?? d.name ?? d.tool) as string | undefined
              if (name && !toolsCalled.includes(name)) toolsCalled.push(name)
            } else if (ev.type === 'skill.loaded' || ev.type === 'turn.skill_loaded') {
              const name = (d.skillName ?? d.name ?? d.skill) as string | undefined
              if (name && !skillsLoaded.includes(name)) skillsLoaded.push(name)
            } else if (
              ev.type === 'session.waiting' ||
              ev.type === 'session.completed' ||
              ev.type === 'session.failed' ||
              ev.type === 'turn.failed'
            ) {
              done = true
            }
          } catch { /* skip malformed lines */ }
        }
      }

      reader.cancel()
      streamIndexRef.current += eventsRead
      setLastTurn({
        totalMs: Date.now() - turnStart,
        firstTokenMs: firstTokenAt ? firstTokenAt - turnStart : null,
        interTokenMs:
          firstTokenAt && lastTokenAt && appendedCount > 1
            ? Math.round((lastTokenAt - firstTokenAt) / (appendedCount - 1))
            : null,
        toolsCalled,
        skillsLoaded,
        eventCount: eventsRead,
      })
      setMessages((prev) => {
        const inputTokens = BASE_TOKENS + Math.ceil(prev.reduce((s, m) => s + m.text.length, 0) / 4)
        const outputTokens = Math.ceil((prev.find((m) => m.id === assistantId)?.text.length ?? 0) / 4)
        setTotalCostUsd((c) => c + (inputTokens * 0.15 + outputTokens * 0.60) / 1_000_000)
        return prev
      })
    } catch (err) {
      console.error('[eve chat]', err)
    } finally {
      setStatus('idle')
    }
  }, [])

  return { messages, status, send, lastTurn, totalCostUsd, restore, snapshot, reset }
}

// ---------------------------------------------------------------------------
// History panel
// ---------------------------------------------------------------------------
function HistoryPanel({
  sessions,
  activeKey,
  onOpen,
  onDelete,
  onNew,
}: {
  sessions: StoredSession[]
  activeKey: string
  onOpen: (s: StoredSession) => void
  onDelete: (key: string) => void
  onNew: () => void
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="p-3 border-b border-border">
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
                <span className="line-clamp-1 text-xs font-medium text-foreground">
                  {s.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {relativeTime(s.updatedAt)} · {Math.floor(s.messages.length / 2)} {s.messages.length / 2 === 1 ? 'exchange' : 'exchanges'}
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

// ---------------------------------------------------------------------------
// Fluid Compute helpers
// ---------------------------------------------------------------------------
function estimateActiveCpu(lastTurn: TurnMeta): number {
  return 30 + lastTurn.toolsCalled.length * 80 + 20
}

function FluidComputeBar({ lastTurn }: { lastTurn: TurnMeta }) {
  const activeCpu = Math.min(estimateActiveCpu(lastTurn), lastTurn.totalMs)
  const idleMs = Math.max(lastTurn.totalMs - activeCpu, 0)
  const savingsPct = Math.round((idleMs / lastTurn.totalMs) * 100)
  const activePct = 100 - savingsPct
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${activePct}%` }} />
        <div className="h-full bg-violet-200 dark:bg-violet-900 transition-all duration-500" style={{ width: `${savingsPct}%` }} />
      </div>
      <div className="flex flex-col gap-1 text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm bg-violet-500" />Active CPU (billed)</span>
          <span className="font-mono">~{activeCpu} ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm bg-violet-200 dark:bg-violet-900" />Idle — waiting on LLM I/O</span>
          <span className="font-mono">~{idleMs.toLocaleString()} ms</span>
        </div>
        <div className="mt-1 flex items-center justify-between font-medium text-foreground">
          <span>Compute saved</span>
          <span className="font-mono text-violet-500">{savingsPct}%</span>
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        With Fluid Compute, the function suspends during LLM I/O and releases CPU.
        You're only billed for the ~{activeCpu} ms of active execution, not the full {lastTurn.totalMs.toLocaleString()} ms wall-clock turn.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent info panel
// ---------------------------------------------------------------------------
function estimateTokens(messages: Message[]): number {
  return Math.ceil(messages.reduce((sum, m) => sum + m.text.length, 0) / 4)
}

function AgentInfoPanel({ lastTurn, messages, totalCostUsd }: { lastTurn: TurnMeta | null; messages: Message[]; totalCostUsd: number }) {
  const skillTokens =
    (lastTurn?.skillsLoaded.includes('faq_guide') ? CTX.skillFaqGuide : 0) +
    (lastTurn?.skillsLoaded.includes('purchase_advisor') ? CTX.skillPurchaseAdvisor : 0)
  const conversationTokens = estimateTokens(messages)
  const totalCtx = BASE_TOKENS + skillTokens + conversationTokens
  const segments = [
    { label: 'Instructions', tokens: CTX.instructions, color: 'bg-zinc-400' },
    { label: 'Tools (×3)', tokens: CTX.toolSearchFaq + CTX.toolGetCatalog + CTX.toolCheckStock, color: 'bg-blue-400' },
    ...(skillTokens > 0 ? [{ label: 'Skills loaded', tokens: skillTokens, color: 'bg-amber-400' }] : []),
    ...(conversationTokens > 0 ? [{ label: 'Conversation', tokens: conversationTokens, color: 'bg-emerald-400' }] : []),
  ]
  const WINDOW = 128_000
  const pct = (t: number) => `${((t / WINDOW) * 100).toFixed(2)}%`

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-xs">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-muted-foreground">
          <span className="font-medium text-foreground">Context window</span>
          <span>{totalCtx.toLocaleString()} / 128K tokens</span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((s) => <div key={s.label} className={`h-full ${s.color}`} style={{ width: pct(s.tokens) }} />)}
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className={`inline-block h-2 w-2 rounded-sm ${s.color}`} />{s.label}</span>
              <span>~{s.tokens}</span>
            </div>
          ))}
          {skillTokens === 0 && (
            <div className="flex items-center justify-between text-muted-foreground opacity-50">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm border border-amber-400" />Skills (on-demand)</span>
              <span>+{CTX.skillFaqGuide}–{CTX.skillFaqGuide + CTX.skillPurchaseAdvisor}</span>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <p className="mb-2 font-medium text-foreground">Latency</p>
        {lastTurn ? (
          <div className="flex flex-col gap-1 text-muted-foreground">
            <div className="flex justify-between"><span>TTFT</span><span className="font-mono">{lastTurn.firstTokenMs !== null ? `${lastTurn.firstTokenMs} ms` : '—'}</span></div>
            <div className="flex justify-between"><span>Avg inter-token</span><span className="font-mono">{lastTurn.interTokenMs !== null ? `${lastTurn.interTokenMs} ms` : '—'}</span></div>
            <div className="flex justify-between"><span>Total turn</span><span className="font-mono">{lastTurn.totalMs.toLocaleString()} ms</span></div>
            <div className="flex justify-between"><span>Skills loaded</span><span className="font-mono">{lastTurn.skillsLoaded.length > 0 ? lastTurn.skillsLoaded.join(', ') : <span className="text-muted-foreground/50">none</span>}</span></div>
            <div className="flex justify-between"><span>Tools called</span><span className="font-mono">{lastTurn.toolsCalled.length > 0 ? lastTurn.toolsCalled.join(', ') : <span className="text-muted-foreground/50">none</span>}</span></div>
          </div>
        ) : (
          <p className="text-muted-foreground">Send a message to see latency.</p>
        )}
      </div>

      <hr className="border-border" />

      <div>
        <p className="mb-2 font-medium text-foreground">Model</p>
        <div className="flex flex-col gap-1 text-muted-foreground">
          <div className="flex justify-between"><span>Model</span><span className="font-mono">gpt-4o-mini</span></div>
          <div className="flex justify-between"><span>Context window</span><span>128K tokens</span></div>
          <div className="flex justify-between"><span>Input cost</span><span>$0.15 / 1M tokens</span></div>
          <div className="flex justify-between"><span>Output cost</span><span>$0.60 / 1M tokens</span></div>
          <div className="flex justify-between font-medium text-foreground">
            <span>Session cost so far</span>
            <span className="font-mono">${totalCostUsd < 0.0001 ? '<$0.0001' : totalCostUsd.toFixed(4)}</span>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium text-foreground">Fluid Compute savings</p>
          <a href="https://vercel.com/docs/functions/fluid-compute" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground underline-offset-2 hover:underline">what's this?</a>
        </div>
        {lastTurn ? <FluidComputeBar lastTurn={lastTurn} /> : <p className="text-muted-foreground">Send a message to see savings.</p>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------
export function FaqBotLauncher() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('chat')
  const [sessions, setSessions] = useState<StoredSession[]>([])
  const [activeKey, setActiveKey] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { messages, status, send, lastTurn, totalCostUsd, restore, snapshot, reset } = useEveChat()
  const isBusy = status !== 'idle'

  // On mount: hydrate from localStorage
  useEffect(() => {
    const stored = loadSessions()
    setSessions(stored)
    if (stored.length > 0) {
      setActiveKey(stored[0].key)
      restore(stored[0])
    } else {
      setActiveKey(crypto.randomUUID())
    }
  }, [restore])

  // After each turn completes: persist to localStorage
  const prevStatus = useRef<Status>('idle')
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
      persistSessions(next)
      return next
    })
  }, [status, messages, totalCostUsd, activeKey, snapshot])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const message = normalizeMessage(new FormData(form).get('message'))
    if (!message || isBusy) return
    void send(message)
    form.reset()
    setView('chat')
  }

  function startNewChat() {
    reset()
    setActiveKey(crypto.randomUUID())
    setView('chat')
  }

  function openSession(s: StoredSession) {
    restore(s)
    setActiveKey(s.key)
    setView('chat')
  }

  function deleteSession(key: string) {
    setSessions((prev) => {
      const next = prev.filter((s) => s.key !== key)
      persistSessions(next)
      // If deleted the active session, start fresh
      if (key === activeKey) {
        reset()
        setActiveKey(crypto.randomUUID())
      }
      return next
    })
  }

  function toggleView(target: View) {
    setView((v) => (v === target ? 'chat' : target))
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[calc(100dvh-6rem)] max-h-[56rem] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:w-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--geist-blue)' }} />
              <span className="text-sm font-medium">FAQ Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              {/* History toggle */}
              <button
                onClick={() => toggleView('history')}
                className={`rounded-md p-1 transition-colors ${view === 'history' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Chat history"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 4v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {/* Internals toggle */}
              <button
                onClick={() => toggleView('internals')}
                className={`rounded-md px-2 py-1 font-mono text-xs transition-colors ${view === 'internals' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Toggle agent internals"
              >
                internals
              </button>
              <button onClick={() => setOpen(false)} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {view === 'internals' ? (
            <AgentInfoPanel lastTurn={lastTurn} messages={messages} totalCostUsd={totalCostUsd} />
          ) : view === 'history' ? (
            <HistoryPanel
              sessions={sessions}
              activeKey={activeKey}
              onOpen={openSession}
              onDelete={deleteSession}
              onNew={startNewChat}
            />
          ) : (
            <>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Ask me anything about shipping, sizing, returns, or stock. I promise not to recommend a unicycle.
                  </p>
                )}
                {messages.map((msg) => {
                  if (msg.role === 'assistant' && msg.text === '') return null
                  return (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-foreground text-background' : 'bg-muted text-foreground'}`}>
                        <span className="whitespace-pre-wrap animate-[fadein_0.15s_ease-in]">{msg.text}</span>
                      </div>
                    </div>
                  )
                })}
                {isBusy && messages.at(-1)?.text === '' && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-muted px-3 py-2"><BikeLoader /></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-3 py-2">
                <input
                  name="message"
                  placeholder="e.g. Will this bike make me faster, or just louder on group rides?"
                  disabled={isBusy}
                  autoComplete="off"
                  maxLength={MAX_MESSAGE_LENGTH}
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
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-opacity hover:opacity-90"
        aria-label="Open FAQ assistant"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.9-.9L3 21l1.9-5.6a8.5 8.5 0 01-.9-3.9A8.38 8.38 0 0112.5 3 8.38 8.38 0 0121 11.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
