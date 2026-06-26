# Vur Selle Bikes — RAG support assistant (AI Cloud)

> **Note:** This repo is a full Solutions Architect demo. I also built **Project 1 (Frontend Cloud)** here — Next.js marketing site, Neon catalog, tag-based caching, basket, and Stripe Checkout. **This README focuses on Project 2: the RAG-based FAQ agent** (Eve, AI SDK, pgvector, evals). The chat widget lives on the same app; browse/checkout code is in the repo but not documented below.

Live demo: https://bike-shop-iota.vercel.app/ (FAQ widget, bottom-right)

---

## What it does

A **RAG-based support assistant** for a UK bike shop: policy answers (shipping, returns, VAT, Cycle to Work, sizing) are **retrieved from Neon pgvector** before the model replies — not invented from training data.

| Capability | Purpose |
|------------|---------|
| **FAQ RAG** | `search_faq` embeds the question (AI SDK + Gateway), vector search on `bike_faq`, model summarises results |
| **Scoped agent** | UK shop only; off-topic and prompt-injection attempts redirected ([`agent/instructions.md`](agent/instructions.md)) |
| **Streaming chat** | Client widget → Eve `/eve/v1/session*` → NDJSON stream |
| **Internals panel** | Per-turn latency, tools/skills trace, rough token cost (demo observability) |
| **Evals** | Eve evals for safety + price hallucination regression ([`agent/eval/`](agent/eval/)) |

**Outcome:** Deflect repetitive support questions with answers grounded in your FAQ, on the same Next.js deploy as the storefront.

---

## RAG architecture

```text
Browser (FAQ widget)
    → Eve agent (withEve, same origin)
         → LLM: gpt-4o-mini via AI Gateway (+ failover)
         → faq_guide skill (on policy questions)
         → search_faq tool
              → AI SDK embed (text-embedding-3-small, Gateway)
              → Neon bike_faq + pgvector (cosine similarity)
         → streamed reply (NDJSON)
```

| Layer | Role |
|-------|------|
| [`agent/instructions.md`](agent/instructions.md) | Always-on scope: search before policy; UK shop only |
| [`agent/skills/faq_guide.md`](agent/skills/faq_guide.md) | When/how to use `search_faq`; similarity thresholds; answer shape |
| [`agent/tools/search_faq.ts`](agent/tools/search_faq.ts) | Embed query → SQL vector search → top-k FAQ rows |
| [`agent/channels/eve.ts`](agent/channels/eve.ts) | Public browser chat (`none()`); Gateway auth server-side |
| [`proxy.ts`](proxy.ts) | Rate limit on `/eve/v1/session*` (demo: in-memory; production: KV) |

The agent also has **purchase** tools (`get_catalog`, `check_bike_stock`) and a `purchase_advisor` skill for bike recommendations — same Eve app, separate from the RAG path documented here.

**Stack (AI Cloud):** Eve 0.13.4 · AI SDK · Vercel AI Gateway · Neon (pgvector) · Next.js 16

---

## Project structure (RAG-relevant)

```
bike-shop/
├── agent/
│   ├── agent.ts              # Model + Gateway failover
│   ├── instructions.md       # Scope + “search FAQ first”
│   ├── channels/eve.ts       # Channel auth
│   ├── skills/faq_guide.md   # RAG playbook
│   ├── tools/search_faq.ts   # Embeddings + pgvector retrieval
│   └── eval/                 # Eve evals (*.eval.ts)
│       ├── evals.config.ts
│       ├── scope.eval.ts
│       ├── district-cb-price.eval.ts
│       └── lib/
├── evals -> agent/eval       # Symlink — Eve CLI requires evals/ at app root
├── components/chat/          # Widget, stream UI, internals panel
├── hooks/use-eve-chat.ts     # Eve POST + NDJSON client
├── scripts/
│   ├── schema.sql            # bike_faq + vector column
│   └── seed-faq.ts           # FAQ rows + embeddings (AI Gateway)
└── proxy.ts                  # Eve session rate limit
```

---

## Prerequisites

- **Node 20+**, **pnpm**
- **Neon Postgres** with `pgvector`
- **Vercel AI Gateway** (chat model + FAQ embeddings)
- **`pnpm dev`** running when running evals locally

---

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local`:

| Variable | Required for RAG | Purpose |
|----------|------------------|---------|
| `DATABASE_URL` | Yes | Neon — `bike_faq` table + pgvector |

Gateway auth for Eve is via Vercel OIDC / local dev in [`agent/channels/eve.ts`](agent/channels/eve.ts). See [Eve docs](https://eve.dev) to link your Vercel team locally.

Other env vars in `.env.example` (Stripe, revalidate secret) are for **Project 1** storefront/checkout only.

---

## Local setup

### 1. Install

```bash
pnpm install
cp .env.example .env.local
# Set DATABASE_URL
```

### 2. Database

Run [`scripts/schema.sql`](scripts/schema.sql) in Neon (creates `bike_faq` with `embedding vector`).

### 3. Seed FAQ (embeddings via AI Gateway)

```bash
pnpm seed:faq
# or full seed (stock + FAQ): pnpm seed
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → FAQ widget bottom-right.

**Try:** “What are your UK shipping options?” · “Is VAT included?” · “Who won the World Cup?” (scope)

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js + Eve agent |
| `pnpm seed:faq` | Seed `bike_faq` + embed via Gateway |
| `pnpm eval` | Run Eve agent evals (`scope` + District CB price) |

---

## Agent configuration

[`agent/agent.ts`](agent/agent.ts)

- **Primary:** `openai/gpt-4o-mini` (cost/latency for support)
- **Failover:** `openai/gpt-4o` → `anthropic/claude-sonnet-4` via [Gateway model fallbacks](https://vercel.com/docs/ai-gateway/models-and-providers/model-fallbacks)

[`agent/tools/search_faq.ts`](agent/tools/search_faq.ts) uses AI SDK:

```ts
embed({ model: gateway.embeddingModel("openai/text-embedding-3-small"), value: query })
```

Then cosine search in Neon (`<=>` operator on `bike_faq.embedding`).

---

## Chat widget

[`components/chat/faq-bot-launcher.tsx`](components/chat/faq-bot-launcher.tsx) composes the launcher shell; [`hooks/use-eve-chat.ts`](hooks/use-eve-chat.ts) handles Eve session POST + NDJSON stream. Assistant replies render as Markdown ([`components/chat/chat-assistant-message.tsx`](components/chat/chat-assistant-message.tsx)).

**Internals tab:** TTFT, tools called, skills loaded, session cost estimate — useful for demo / interview discussion of operability.

---

## Evaluation

Evals in [`agent/eval/`](agent/eval/). Symlink **`evals` → `agent/eval`** so `eve eval` discovers them.

```bash
pnpm dev    # terminal 1
pnpm eval   # terminal 2
```

| File | What it checks |
|------|----------------|
| [`scope.eval.ts`](agent/eval/scope.eval.ts) | Off-topic redirect; prompt injection without leaking instructions |
| [`district-cb-price.eval.ts`](agent/eval/district-cb-price.eval.ts) | Tool-use hallucination: `get_catalog` + correct District CB price (optional commerce regression) |

Deployed target:

```bash
pnpm exec eve eval --url https://your-app.vercel.app
```

---

## Deploy on Vercel

1. Import repo; set `DATABASE_URL`
2. Link project for AI Gateway (Eve + embeddings)
3. Deploy — `withEve()` in [`next.config.mjs`](next.config.mjs) bundles the agent
4. Run `pnpm seed:faq` against production Neon (or seed locally once)

**Rate limiting:** [`proxy.ts`](proxy.ts) — 10 req/min/IP on Eve sessions (use Vercel KV in production).

---

## Code walkthrough (RAG)

1. [`agent/tools/search_faq.ts`](agent/tools/search_faq.ts) — RAG retrieval (AI SDK + pgvector)
2. [`agent/skills/faq_guide.md`](agent/skills/faq_guide.md) — context selection / similarity bands
3. [`agent/instructions.md`](agent/instructions.md) — scope and safety
4. [`hooks/use-eve-chat.ts`](hooks/use-eve-chat.ts) — streaming client
5. [`agent/eval/scope.eval.ts`](agent/eval/scope.eval.ts) — lightweight safety eval

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Chat 401 / fails locally | Eve channel auth — localhost should pass `localDev()`; production needs `none()` for public widget |
| “No relevant FAQ entries” | Run `pnpm seed:faq` |
| Chat fails after dev restart | **New chat** or clear `vs_sessions` in localStorage |
| `pnpm eval` fails | Dev server running; `DATABASE_URL` set; `pnpm seed:faq` done |
| Embedding / Gateway errors | Link Vercel project for Gateway; check Eve docs for local OIDC |
