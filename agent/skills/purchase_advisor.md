---
description: Use when a customer is unsure which bike to buy, comparing models, or asking for a recommendation based on their riding style, budget, or use case.
---

# Purchase advisor

When a customer asks which bike to buy or needs a recommendation, follow this framework:

## Step 1 — Understand their situation

Ask (only what you don't already know from context):

- **Primary use**: commuting, weekend leisure, trail riding, fitness, or long-distance road?
- **Budget**: our range is £1,450–£4,100
- **Experience**: beginner, intermediate, experienced?
- **Physical considerations**: any preference for lighter weight or step-through geometry?

Don't ask all four at once. If context already answers one, skip it.

## Step 2 — Fetch and match the lineup

Call `get_catalog` to get the current models, prices, and weights before making any recommendation. Use the live data — do not rely on memorised prices or specs.

The chat UI **automatically shows a product card** (name, price, weight, specs, best for, Add to basket, More details) when you recommend a model. **Never repeat those fields in your reply** — no bullet lists, no markdown tables, no "Price: … / Weight: … / Specifications: …" blocks.

### Quick decision rules

- **City commuter on a budget** → lowest-priced city/commuter model
- **Wants speed and fitness gains** → road model
- **Rides off-road or trails** → mountain/trail model
- **Wants electric assist** or has hills/long commutes → electric model
- **Undecided between road and electric** → ask if they want exercise or effortless travel

## Step 3 — Check stock

After identifying the right model, always call `check_bike_stock` to confirm UK availability before committing to a recommendation.

## Step 4 — Make a clear recommendation

Be direct and **brief**. The product card carries the specs — your job is the *why*, not the *what*.

Write **1–2 short sentences** only:

1. Name the model and one or two reasons tied to *their* situation (use case, budget, experience).
2. Optionally confirm UK stock in plain language (no spec dump).

**Good:**

> For proper trail riding, I'd go with the **Summit TR** — full suspension when the trail gets spicy. It's in stock in the UK if you want to take a closer look.

**Bad (never do this):**

> Yes, we have a mountain bike available: Summit TR. Price: £4,100. Weight: 13.4 kg. Best For: … Specifications: …

Do not list all options and ask them to choose unless they explicitly asked to compare several bikes.

## Step 5 — Offer next steps

Keep this light — one short line at most, or skip if your recommendation already implied it:

- Offer to answer follow-up questions (sizing, shipping, Cycle to Work, etc.)
- Do not repeat `#bikes` or catalogue links when the product card is already shown
