# Vur Selle Bikes : RAG support assistant

> **Note:** This repo is a full demo. I also built **Project 1 (Frontend Cloud)** here — Next.js marketing site, Neon catalog, tag-based caching, basket, and Stripe Checkout. **This README focuses on Project 2: the RAG-based FAQ agent** (Eve, AI SDK, pgvector, evals). The chat widget lives on the same app; browse/checkout code is in the repo but not documented below.

Live demo: https://bike-shop-iota.vercel.app/ (FAQ widget, bottom-right)

---

You are a bike manufacturer that just built a complimentary eshop. You have reached out to us because you would like to add a support agent. You tried to vibe code this support agent but you encountered the following issues : 
* **Hallucinations & Isolation:** The bot hallucinated return policies and lacked real-time visibility into inventory across regional shopping points.
* **Vendor Lock-in:** Swapping or testing new LLMs required rewriting extensive glue code.
* **Financial & Scale Risk:** No visibility into token spend, no failover strategy for traffic spikes, and high idle-compute costs.
* **Security Vulnerabilities:** Exposed API keys, lack of rate-limiting, and susceptibility to prompt injections.

---

## The Solution & Architecture

### 1. Context-Aware Reliability (RAG & Live Tools)
Instead of relying on base model knowledge, we implemented a **Retrieval-Augmented Generation (RAG)** pipeline:
* **Grounded Policy:** Internal FAQs and shipping policies are embedded and retrieved dynamically, eliminating hallucinations.
* **Real-Time Inventory:** The agent utilizes tool-calling (Function Calling) to query live database stock, allowing users to check local availability and purchase bikes directly in the chat.

### 2. Operational Resilience & Cost Control (AI Gateway + SDK)
To solve the operational overhead, we decoupled the application layer from the LLM providers:
* **AI SDK:** Abstracts provider-specific APIs, allowing seamless model swapping with zero glue-code changes.
* **AI Gateway:** Introduces full observability into token spend, automatic failover routing if primary providers hit rate limits, and request caching.
* **Fluid Compute (Vercel):** Dramatically lowers infrastructure costs by billing only on active CPU time during stream generation.


| Capability | Purpose |
|------------|---------|
| **FAQ RAG** | `search_faq` embeds the question (AI SDK + Gateway), vector search on `bike_faq`, model summarises results |
| **Scoped agent** | Off-topic and prompt-injection attempts redirected ([`agent/instructions.md`](agent/instructions.md)) |
| **Streaming chat** | Client widget → Eve `/eve/v1/session*` → stream |
| **Internals panel** | Per-turn latency, tools/skills trace, rough token cost (demo observability) |
| **Evals** | Eve evals for safety with price hallucination regression ([`evals/`](evals/)) |


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
│   └── tools/search_faq.ts   # Embeddings + pgvector retrieval
├── evals/                    # Eve evals (*.eval.ts) — discovered by `pnpm eval`
│   ├── evals.config.ts
│   ├── scope.eval.ts
│   ├── district-cb-price.eval.ts
│   └── lib/
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
- **`pnpm eval`** spins up a temporary local server — no need to run `pnpm dev` first

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

Evals live in [`evals/`](evals/) at the project root (required by `eve eval`).

```bash
pnpm eval
```

| File | What it checks |
|------|----------------|
| [`scope.eval.ts`](evals/scope.eval.ts) | Off-topic redirect; prompt injection without leaking instructions |
| [`district-cb-price.eval.ts`](evals/district-cb-price.eval.ts) | Tool-use hallucination: `get_catalog` + correct District CB price (optional commerce regression) |

Deployed target:

```bash
pnpm exec eve eval --url https://your-app.vercel.app
```


