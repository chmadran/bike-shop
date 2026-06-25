# Vur Selle Bikes — AI support demo

A UK bike-shop landing page (**Frontend Cloud**) with an embedded **Eve-powered FAQ & purchase advisor** (**AI Cloud**). Built for a Vercel Solutions Architect project review.

**Live demo:** _[add your Vercel deployment URL before sending to recruiters]_

## What it does

| Surface | Purpose |
|---------|---------|
| **Marketing site** | Static RSC catalog — fast LCP, mobile-responsive |
| **FAQ bot** | RAG over Neon pgvector + live inventory tools |
| **Internals panel** | Per-turn latency, tool/skill trace, token & Fluid Compute estimates |

**Business outcome:** Accurate policy answers (grounded in FAQ), stock-aware bike recommendations, lower support deflection risk.

## Architecture

```
Browser → Next.js 16 (withEve) → Eve agent (gpt-4o-mini via AI Gateway)
                                      ├─ search_faq  → Neon bike_faq + pgvector
                                      ├─ get_catalog → Neon bike_stock
                                      └─ check_bike_stock → Neon bike_stock
```

**Stack:** Next.js 16 · React 19 · Eve 0.13.4 · AI SDK + Gateway · Neon · Tailwind 4 · Geist

## Local setup

**Prerequisites:** Node 20+, pnpm, Neon Postgres, AI Gateway access.

```bash
pnpm install
cp .env.example .env.local   # add DATABASE_URL

# One-time DB setup (Neon SQL editor or psql):
#   scripts/schema.sql

pnpm seed                    # bike_stock + bike_faq (idempotent)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and use the chat widget (bottom-right).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js + Eve agent |
| `pnpm build` | Production build |
| `pnpm seed` | Seed stock + FAQ vectors (from `lib/bikes.ts` + FAQ corpus) |
| `pnpm seed:stock` / `pnpm seed:faq` | Seed one table only |
| `pnpm eval` | Automated RAG + catalog price regression |

Schema: [`scripts/schema.sql`](scripts/schema.sql)

### Evaluation approach

1. **Automated RAG regression** — 6 golden queries against `search_faq` retrieval
2. **Automated catalog price check** — `bike_stock` prices match `lib/bikes.ts`; flags common wrong prices
3. **Manual agent rubric** — routing, scope, injection cases printed at end of `pnpm eval`

Golden set: [`eval/golden-set.json`](eval/golden-set.json)

## 15-minute demo script (interview)

| Step | Action | Point to make |
|------|--------|---------------|
| 1 | Load homepage | Static RSC + Features/FAQ sections; chat is the only client island |
| 2 | Open chat → **Internals** | Observability: context, cost, Fluid Compute |
| 3 | *"Is VAT included in UK pricing?"* | `search_faq` + `faq_guide` — grounded, not memory |
| 4 | *"I commute in London, budget ~£2k — which bike?"* | `purchase_advisor` → `get_catalog` → `check_bike_stock` |
| 5 | Refresh page | Session restored (localStorage + Eve tokens) |
| 6 | *"Who won the World Cup?"* | Out-of-scope redirect |
| 7 | `pnpm eval` | Show automated checks passing |

## Code walkthrough (pick 5 files)

1. [`next.config.mjs`](next.config.mjs) — `withEve()`
2. [`agent/tools/search_faq.ts`](agent/tools/search_faq.ts) — RAG
3. [`agent/instructions.md`](agent/instructions.md) + [`agent/skills/`](agent/skills/)
4. [`components/faq-bot-launcher.tsx`](components/faq-bot-launcher.tsx) — streaming client
5. [`agent/channels/eve.ts`](agent/channels/eve.ts) — auth model

## Rendering & performance

- **Homepage:** Server Components, static at build
- **Chat:** Client component for Eve streaming
- **Images:** Next.js Image Optimization (WebP/AVIF on Vercel)
- **Rate limiting:** 10 req/min/IP on `/eve/v1/session*` in [`proxy.ts`](proxy.ts) — production → Vercel KV

## Known limitations

- English-only UK shop (copy in `lib/content.ts`, catalog in `lib/bikes.ts`)
- No Vercel Workflows for business flows yet
- In-process rate limit (not durable across serverless instances)

## License

Private demo project.
