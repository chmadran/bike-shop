# Vur Selle Bikes

A UK bike-shop demo built for a Vercel Solutions Architect review: a **Next.js marketing site** (Frontend Cloud) plus an **Eve-powered FAQ and purchase advisor** (AI Cloud), with live inventory from Neon, tag-based catalog caching, and Stripe Checkout.

Live demo: https://bike-shop-iota.vercel.app/ 

---

## What it does

| Surface | Purpose |
|---------|---------|
| **Marketing site** | Server-rendered catalog, bike detail pages, hero and features |
| **FAQ bot** | RAG over Neon pgvector + live stock/catalog tools |
| **Basket & checkout** | Client basket (localStorage) + Stripe Checkout (test mode) |
| **Internals panel** | Per-turn latency, tool/skill trace, token and cost estimates |

**Outcome:** Policy answers grounded in FAQ data, stock-aware bike recommendations, and a credible commerce flow without inventing prices.

---

## Architecture

Three separate paths share one Neon database but do not all go through Eve:

| Path | What happens |
|------|----------------|
| **Browse** | RSC pages read the catalog through `lib/bikes-catalog.ts` (tagged `unstable_cache`, on-demand revalidate). |
| **Chat** | The FAQ widget streams NDJSON from Eve (`/eve/v1/session*`), rate-limited by `proxy.ts`. The agent calls tools that query Neon; the LLM (and FAQ embeddings) go through Vercel AI Gateway. |
| **Checkout** | Basket lives in `localStorage`; `POST /api/checkout` validates prices from the same catalog cache, then redirects the browser to Stripe Hosted Checkout. |


**Agent tools**

| Tool | Data |
|------|------|
| `search_faq` | `bike_faq` + pgvector embeddings |
| `get_catalog` | `bike_stock` (distinct on `model_id`) |
| `check_bike_stock` | `bike_stock` per warehouse |

**Stack:** Next.js 16 · Eve 0.13.4 · AI SDK + Gateway · Neon · Stripe  

---

## Project structure

```
bike-shop/
├── agent/                 # Eve agent
│   ├── agent.ts           # Model + AI Gateway failover
│   ├── instructions.md    # Agent personality, always-on system prompt
│   ├── channels/eve.ts    # Auth (local dev, OIDC, public browser)
│   ├── eval/              # Eve evals (*.eval.ts)
│   │   ├── evals.config.ts
│   │   ├── scope.eval.ts           # off-topic + prompt injection
│   │   ├── district-cb-price.eval.ts  # price hallucination (£1,450)
│   │   └── lib/                    # assertions + catalog preflight
│   ├── skills/            # faq_guide, purchase_advisor
│   └── tools/             # search_faq, get_catalog, check_bike_stock
├── evals -> agent/eval     # Symlink — Eve CLI discovers evals/ at app root only
├── app/                   # Next.js App Router
│   ├── api/checkout/      # Stripe Checkout session
│   ├── api/revalidate/    # On-demand ISR (tag `bikes`)
│   ├── basket/
│   └── bikes/             # Grid + ?bike={modelId} detail
├── components/
│   ├── chat/              # FAQ widget (launcher, stream UI, internals)
│   ├── basket/            # Cart + checkout button
│   ├── bike/              # Catalog cards and detail
│   └── site/              # Header, footer, hero, features
├── data/
│   └── bike-catalog.json  # Seed + static image paths
├── lib/
│   ├── bikes-catalog.ts   # Neon catalog + unstable_cache
│   └── bike-assets.ts     # Image paths from JSON
└── scripts/
    ├── schema.sql
    ├── migrate-catalog.sql
    ├── seed-stock.ts
    └── seed-faq.ts
```

---

## Prerequisites

- **Node 20+** (Eve scaffold targets Node 24; 20+ usually works locally)
- **pnpm**
- **Neon Postgres** with the `vector` extension
- **Vercel AI Gateway** access (chat + FAQ embeddings)
- **Stripe** test keys (optional, for checkout)

---

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon connection string |
| `REVALIDATE_SECRET` | Recommended | Protects `POST /api/revalidate` |
| `NEXT_PUBLIC_SITE_URL` | For Stripe | Checkout redirect base URL |
| `STRIPE_SECRET_KEY` | For checkout | Server-side Stripe |

AI Gateway auth for Eve is handled via Vercel OIDC / local dev helpers in [`agent/channels/eve.ts`](agent/channels/eve.ts)—see [Eve docs](https://eve.dev) for linking your Vercel team locally.

---

## Local setup

### 1. Install and configure

```bash
pnpm install
cp .env.example .env.local
# Edit .env.local — at minimum set DATABASE_URL
```

### 2. Database

**New database:** run [`scripts/schema.sql`](scripts/schema.sql) in the Neon SQL editor (or `psql`).

**Existing database** (missing `model_id` / display columns): run [`scripts/migrate-catalog.sql`](scripts/migrate-catalog.sql) once, then seed.

### 3. Seed data

```bash
pnpm seed          # bike_stock + bike_faq (embeddings via AI Gateway)
# or
pnpm seed:stock    # stock only
pnpm seed:faq      # FAQ vectors only
```

Catalog rows are keyed by **`model_id`** (e.g. `meridian-rd`). Marketing copy and image paths come from [`data/bike-catalog.json`](data/bike-catalog.json).

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Chat widget is bottom-right.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js + Eve agent |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint |
| `pnpm seed` | Seed stock + FAQ |
| `pnpm seed:stock` / `pnpm seed:faq` | Seed one table |
| `pnpm eval` | Run Eve agent evals (scope + District CB price) |

---

## Catalog and ISR

Bike pages load from Neon through [`lib/bikes-catalog.ts`](lib/bikes-catalog.ts):

- **Cache tags:** `bikes` (full catalog), `bike:{modelId}` (reserved for granular invalidation)
- **Images:** always from [`data/bike-catalog.json`](data/bike-catalog.json) + `public/bikes/` (not DB pixels)
- **Prices/stock metadata:** from `bike_stock` via `DISTINCT ON (model_id)`

After changing stock in Neon or re-seeding:

```bash
curl -X POST "http://localhost:3000/api/revalidate?tag=bikes" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET"
```

`pnpm seed:stock` calls this automatically when `REVALIDATE_SECRET` is set and the dev server is running.

On Vercel, add `REVALIDATE_SECRET` to project env vars and use your production URL in the curl command (or rely on redeploy).

---

## Eve agent

**Config:** [`agent/agent.ts`](agent/agent.ts)

- **Primary model:** `openai/gpt-4o-mini`
- **Gateway failover:** `openai/gpt-4o` → `anthropic/claude-sonnet-4` if the primary fails ([Model Fallbacks](https://vercel.com/docs/ai-gateway/models-and-providers/model-fallbacks))

**Skills** (loaded on demand):

- `faq_guide` — policy, shipping, VAT, sizing
- `purchase_advisor` — recommendations; must call `get_catalog` before quoting prices

**Scope:** UK shop only; out-of-scope questions are redirected ([`agent/instructions.md`](agent/instructions.md)).

**Chat UX:** [`components/chat/faq-bot-launcher.tsx`](components/chat/faq-bot-launcher.tsx) streams Eve events, shows a single recommended product card (not a full catalog dump), and retries once if stale session tokens fail after a dev restart.

---

## Stripe Checkout

1. Add test keys to `.env.local`
2. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
3. Add bikes from detail pages or chat cards → **Basket** → **Pay with Stripe**

Checkout line items are resolved server-side from the cached catalog ([`app/api/checkout/route.ts`](app/api/checkout/route.ts)).

---

## Evaluation

Evals live in [`agent/eval/`](agent/eval/). Eve discovers only a top-level `evals/` folder, so this repo symlinks **`evals` → `agent/eval`**.

**Prerequisites:** `pnpm seed`, `DATABASE_URL` in `.env.local`, and **`pnpm dev` running** in another terminal.

```bash
pnpm dev    # terminal 1
pnpm eval   # terminal 2 — 3 cases across 2 eval files
```

| File | What it checks |
|------|----------------|
| [`scope.eval.ts`](agent/eval/scope.eval.ts) | Off-topic redirect; prompt-injection refusal without leaking instructions |
| [`district-cb-price.eval.ts`](agent/eval/district-cb-price.eval.ts) | Neon catalog matches seed; agent calls `get_catalog` and quotes **£1,450** for District CB (not £999 / £1,999 / £2,500) |

Against a deployed app:

```bash
pnpm exec eve eval --url https://your-app.vercel.app
```




