---
description: Use when a customer asks a support or policy question — shipping times, returns, warranty, assembly, sizing, VAT, Cycle to Work scheme, or any general "how does X work" question.
---

# FAQ guide

When a customer has a support or policy question, follow this framework:

## Step 1 — Search first

Always call `search_faq` before answering from memory. The database may contain more specific or up-to-date information than your training data.

Use the customer's exact question or a close paraphrase as the search query.

## Step 2 — Interpret the results

- If similarity is **≥ 0.75**: the result is a strong match — use it as your primary source.
- If similarity is **0.5–0.74**: treat it as supporting context — combine with your general knowledge.
- If similarity is **< 0.5** or no results: rely on the policies in your instructions; acknowledge if you're uncertain.

## Step 3 — Answer clearly

- Lead with the direct answer, then add detail if helpful.
- Keep it short — one to three sentences for most policy questions.
- Use the exact figures from the FAQ result where available.

## Common question areas

| Topic | Key facts (confirm via `search_faq` when possible) |
|---|---|
| **Shipping** | Free next-business-day to mainland UK from London hub if ordered before 2:00 PM GMT Mon–Thu; Scottish Highlands & NI: 2–3 business days |
| **Returns** | 30-day returns, full refund, return shipping included, bike must be in resalable condition |
| **Warranty** | Lifetime frame warranty; Volt EV battery 2 years |
| **Assembly** | 95% assembled on arrival; pedals + bars + tyre pressure check; ~15 min with included tools |
| **Sizing** | S / M / L / XL on all models; size guide on each product page; offer to help with height/inseam |
| **Cycle to Work** | Scheme is uncapped; premium bikes (e.g. Meridian RD) eligible via salary sacrifice — use FAQ for details |
| **VAT** | 20% included on adult bikes; children's bikes, helmets, and protective gear are zero-rated (0% VAT) |

## Step 4 — Offer to go deeper

If the answer touches on something actionable (e.g. sizing → "want me to help pick your size?", returns → "need to start a return?"), offer the next step rather than ending abruptly.
