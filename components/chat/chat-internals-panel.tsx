import { CHAT_BASE_TOKENS, CHAT_CTX } from '@/lib/chat-constants'
import type { ChatMessage, TurnMeta } from '@/lib/chat-types'

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
        <div
          className="h-full bg-violet-200 transition-all duration-500 dark:bg-violet-900"
          style={{ width: `${savingsPct}%` }}
        />
      </div>
      <div className="flex flex-col gap-1 text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-violet-500" />
            Active CPU (billed)
          </span>
          <span className="font-mono">~{activeCpu} ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-violet-200 dark:bg-violet-900" />
            Idle — waiting on LLM I/O
          </span>
          <span className="font-mono">~{idleMs.toLocaleString()} ms</span>
        </div>
        <div className="mt-1 flex items-center justify-between font-medium text-foreground">
          <span>Compute saved</span>
          <span className="font-mono text-violet-500">{savingsPct}%</span>
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        With Fluid Compute, the function suspends during LLM I/O and releases CPU. You&apos;re only
        billed for the ~{activeCpu} ms of active execution, not the full {lastTurn.totalMs.toLocaleString()}{' '}
        ms wall-clock turn.
      </p>
    </div>
  )
}

function estimateTokens(messages: ChatMessage[]): number {
  return Math.ceil(messages.reduce((sum, m) => sum + m.text.length, 0) / 4)
}

type ChatInternalsPanelProps = {
  lastTurn: TurnMeta | null
  messages: ChatMessage[]
  totalCostUsd: number
}

export function ChatInternalsPanel({ lastTurn, messages, totalCostUsd }: ChatInternalsPanelProps) {
  const skillTokens =
    (lastTurn?.skillsLoaded.includes('faq_guide') ? CHAT_CTX.skillFaqGuide : 0) +
    (lastTurn?.skillsLoaded.includes('purchase_advisor') ? CHAT_CTX.skillPurchaseAdvisor : 0)
  const conversationTokens = estimateTokens(messages)
  const totalCtx = CHAT_BASE_TOKENS + skillTokens + conversationTokens
  const segments = [
    { label: 'Instructions', tokens: CHAT_CTX.instructions, color: 'bg-zinc-400' },
    {
      label: 'Tools (×3)',
      tokens: CHAT_CTX.toolSearchFaq + CHAT_CTX.toolGetCatalog + CHAT_CTX.toolCheckStock,
      color: 'bg-blue-400',
    },
    ...(skillTokens > 0 ? [{ label: 'Skills loaded', tokens: skillTokens, color: 'bg-amber-400' }] : []),
    ...(conversationTokens > 0
      ? [{ label: 'Conversation', tokens: conversationTokens, color: 'bg-emerald-400' }]
      : []),
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
          {segments.map((s) => (
            <div key={s.label} className={`h-full ${s.color}`} style={{ width: pct(s.tokens) }} />
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-sm ${s.color}`} />
                {s.label}
              </span>
              <span>~{s.tokens}</span>
            </div>
          ))}
          {skillTokens === 0 && (
            <div className="flex items-center justify-between text-muted-foreground opacity-50">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-sm border border-amber-400" />
                Skills (on-demand)
              </span>
              <span>
                +{CHAT_CTX.skillFaqGuide}–{CHAT_CTX.skillFaqGuide + CHAT_CTX.skillPurchaseAdvisor}
              </span>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <p className="mb-2 font-medium text-foreground">Latency</p>
        {lastTurn ? (
          <div className="flex flex-col gap-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>TTFT</span>
              <span className="font-mono">
                {lastTurn.firstTokenMs !== null ? `${lastTurn.firstTokenMs} ms` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg inter-token</span>
              <span className="font-mono">
                {lastTurn.interTokenMs !== null ? `${lastTurn.interTokenMs} ms` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total turn</span>
              <span className="font-mono">{lastTurn.totalMs.toLocaleString()} ms</span>
            </div>
            <div className="flex justify-between">
              <span>Skills loaded</span>
              <span className="font-mono">
                {lastTurn.skillsLoaded.length > 0 ? (
                  lastTurn.skillsLoaded.join(', ')
                ) : (
                  <span className="text-muted-foreground/50">none</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tools called</span>
              <span className="font-mono">
                {lastTurn.toolsCalled.length > 0 ? (
                  lastTurn.toolsCalled.join(', ')
                ) : (
                  <span className="text-muted-foreground/50">none</span>
                )}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Send a message to see latency.</p>
        )}
      </div>

      <hr className="border-border" />

      <div>
        <p className="mb-2 font-medium text-foreground">Model</p>
        <div className="flex flex-col gap-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Model</span>
            <span className="font-mono">gpt-4o-mini</span>
          </div>
          <div className="flex justify-between">
            <span>Context window</span>
            <span>128K tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Input cost</span>
            <span>$0.15 / 1M tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Output cost</span>
            <span>$0.60 / 1M tokens</span>
          </div>
          <div className="flex justify-between font-medium text-foreground">
            <span>Session cost so far</span>
            <span className="font-mono">
              ${totalCostUsd < 0.0001 ? '<$0.0001' : totalCostUsd.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium text-foreground">Fluid Compute savings</p>
          <a
            href="https://vercel.com/docs/functions/fluid-compute"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground underline-offset-2 hover:underline"
          >
            what&apos;s this?
          </a>
        </div>
        {lastTurn ? (
          <FluidComputeBar lastTurn={lastTurn} />
        ) : (
          <p className="text-muted-foreground">Send a message to see savings.</p>
        )}
      </div>
    </div>
  )
}
