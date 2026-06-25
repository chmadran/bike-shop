'use client'

import { useRef, useState, useCallback } from 'react'
import {
  CHAT_BASE_TOKENS,
  CHAT_ERROR_MESSAGE,
  MAX_MESSAGE_LENGTH,
} from '@/lib/chat-constants'
import type { ChatMessage, ChatStatus, StoredSession, TurnMeta } from '@/lib/chat-types'
import {
  buildRecommendedBikeAttachment,
  focusModelFromStockInput,
  focusModelFromStockResult,
  inferFocusModelFromText,
  mergeAttachments,
  parseCatalogOutput,
  skillNameFromActionResult,
  toolNameFromActionResult,
  type PendingToolCall,
} from '@/lib/chat-tool-results'

export function useEveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [lastTurn, setLastTurn] = useState<TurnMeta | null>(null)
  const [totalCostUsd, setTotalCostUsd] = useState(0)
  const sessionIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const streamIndexRef = useRef(0)

  const restore = useCallback((s: StoredSession) => {
    setMessages(s.messages)
    setTotalCostUsd(s.totalCostUsd)
    setLastTurn(null)
    sessionIdRef.current = s.eveSessionId
    tokenRef.current = s.continuationToken
    streamIndexRef.current = s.streamIndex
  }, [])

  const snapshot = useCallback(
    (msgs: ChatMessage[], cost: number): Omit<StoredSession, 'key' | 'title' | 'createdAt' | 'updatedAt'> => ({
      eveSessionId: sessionIdRef.current,
      continuationToken: tokenRef.current,
      streamIndex: streamIndexRef.current,
      messages: msgs,
      totalCostUsd: cost,
    }),
    [],
  )

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

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: trimmed }
    const assistantId = crypto.randomUUID()
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '', attachments: [] }])
    setStatus('loading')

    const turnStart = Date.now()

    const clearEveSession = () => {
      sessionIdRef.current = null
      tokenRef.current = null
      streamIndexRef.current = 0
    }

    const runTurn = async (): Promise<{ failed: boolean; gotText: boolean }> => {
      let firstTokenAt: number | null = null
      let lastTokenAt: number | null = null
      let appendedCount = 0
      const toolsCalled: string[] = []
      const skillsLoaded: string[] = []
      const pendingCalls = new Map<string, PendingToolCall>()
      let turnCatalog: ReturnType<typeof parseCatalogOutput> = null
      let focusModel: string | null = null
      let assistantText = ''
      let turnFailed = false

      const applyRecommendedAttachment = () => {
        const model = focusModel ?? inferFocusModelFromText(assistantText, turnCatalog)
        const attachment = buildRecommendedBikeAttachment(turnCatalog, model)
        if (!attachment) return

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, attachments: mergeAttachments(m.attachments, attachment) }
              : m,
          ),
        )
      }

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

      if (!res.ok) {
        return { failed: true, gotText: false }
      }

      const json = (await res.json()) as {
        ok?: boolean
        sessionId?: string
        continuationToken?: string
      }
      if (json.ok === false) {
        return { failed: true, gotText: false }
      }

      sessionIdRef.current =
        res.headers.get('x-eve-session-id') ?? json.sessionId ?? sessionIdRef.current
      tokenRef.current = json.continuationToken ?? tokenRef.current

      if (!sessionIdRef.current) {
        return { failed: true, gotText: false }
      }

      setStatus('streaming')
      const stream = await fetch(
        `/eve/v1/session/${sessionIdRef.current}/stream?startIndex=${streamIndexRef.current}`,
      )
      if (!stream.ok || !stream.body) {
        return { failed: true, gotText: false }
      }

      const reader = stream.body.getReader()
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
              assistantText = cumulative
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, text: cumulative } : m)),
              )
            } else if (ev.type === 'message.completed') {
              const final =
                typeof d.message === 'string'
                  ? d.message
                  : (() => {
                      const msg = d.message as { parts?: { type: string; text?: string }[] } | undefined
                      return msg?.parts?.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('') ?? ''
                    })()
              if (final) {
                assistantText = final
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: final } : m)),
                )
              }
            } else if (ev.type === 'actions.requested') {
              const actions = d.actions as {
                callId?: string
                toolName?: string
                kind?: string
                input?: unknown
              }[] | undefined
              for (const action of actions ?? []) {
                if (action.kind !== 'tool-call' || !action.toolName) continue
                if (action.callId) {
                  pendingCalls.set(action.callId, {
                    toolName: action.toolName,
                    input: action.input,
                  })
                }
                const name = toolNameFromActionResult({
                  kind: 'tool-result',
                  toolName: action.toolName,
                })
                if (name && !toolsCalled.includes(name)) toolsCalled.push(name)

                if (name === 'check_bike_stock') {
                  const model = focusModelFromStockInput(action.input)
                  if (model) focusModel = model
                }
              }
            } else if (ev.type === 'action.result' && d.status === 'completed') {
              const result = (d.result ?? {}) as {
                kind?: string
                toolName?: string
                name?: string
                output?: unknown
                callId?: string
              }
              const toolName = toolNameFromActionResult(result)
              if (toolName && !toolsCalled.includes(toolName)) toolsCalled.push(toolName)

              const skillName = skillNameFromActionResult(result)
              if (skillName && !skillsLoaded.includes(skillName)) skillsLoaded.push(skillName)

              if (toolName === 'check_bike_stock') {
                const pending = result.callId ? pendingCalls.get(result.callId) : undefined
                const model = focusModelFromStockResult(pending?.input, result.output)
                if (model) focusModel = model
              } else if (toolName === 'get_catalog') {
                turnCatalog = parseCatalogOutput(result.output) ?? turnCatalog
              }
            } else if (ev.type === 'tool.started' || ev.type === 'turn.tool_called') {
              const name = (d.toolName ?? d.name ?? d.tool) as string | undefined
              if (name && !toolsCalled.includes(name)) toolsCalled.push(name)
            } else if (ev.type === 'skill.loaded' || ev.type === 'turn.skill_loaded') {
              const name = (d.skillName ?? d.name ?? d.skill) as string | undefined
              if (name && !skillsLoaded.includes(name)) skillsLoaded.push(name)
            } else if (ev.type === 'session.failed' || ev.type === 'turn.failed') {
              turnFailed = true
              applyRecommendedAttachment()
              done = true
            } else if (ev.type === 'session.waiting' || ev.type === 'session.completed') {
              applyRecommendedAttachment()
              done = true
            }
          } catch {
            /* skip malformed lines */
          }
        }
      }

      reader.cancel()
      applyRecommendedAttachment()
      streamIndexRef.current += eventsRead

      if (!turnFailed) {
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
          const inputTokens = CHAT_BASE_TOKENS + Math.ceil(prev.reduce((s, m) => s + m.text.length, 0) / 4)
          const outputTokens = Math.ceil((prev.find((m) => m.id === assistantId)?.text.length ?? 0) / 4)
          setTotalCostUsd((c) => c + (inputTokens * 0.15 + outputTokens * 0.60) / 1_000_000)
          return prev
        })
      }

      return { failed: turnFailed, gotText: assistantText.trim().length > 0 }
    }

    try {
      const hadStoredSession = !!(sessionIdRef.current || tokenRef.current)
      let result = await runTurn()

      if ((result.failed || !result.gotText) && hadStoredSession) {
        clearEveSession()
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: '', attachments: [] } : m)),
        )
        setStatus('loading')
        result = await runTurn()
      }

      if (result.failed || !result.gotText) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: CHAT_ERROR_MESSAGE, attachments: [] } : m,
          ),
        )
      }
    } catch (err) {
      console.error('[eve chat]', err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: CHAT_ERROR_MESSAGE, attachments: [] } : m,
        ),
      )
    } finally {
      setStatus('idle')
    }
  }, [])

  return { messages, status, send, lastTurn, totalCostUsd, restore, snapshot, reset }
}
