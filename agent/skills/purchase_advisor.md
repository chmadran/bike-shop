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

Present the options as a table (model, best for, weight, price in GBP). Filter out any models marked unavailable.

### Quick decision rules

- **City commuter on a budget** → lowest-priced city/commuter model
- **Wants speed and fitness gains** → road model
- **Rides off-road or trails** → mountain/trail model
- **Wants electric assist** or has hills/long commutes → electric model
- **Undecided between road and electric** → ask if they want exercise or effortless travel

## Step 3 — Check stock

After identifying the right model, always call `check_bike_stock` to confirm UK availability before committing to a recommendation.

## Step 4 — Make a clear recommendation

Be direct. Say: *"Based on what you've told me, I'd go with the [model]."* Give one or two reasons specific to their situation. Don't list all options and ask them to choose.

## Step 5 — Offer next steps

- Confirm availability (already done in step 3)
- Point them to the bikes section: `#bikes`
- Offer to answer follow-up questions (sizing, shipping, Cycle to Work, etc.)
