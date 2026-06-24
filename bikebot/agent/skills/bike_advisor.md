---
description: Use when a customer is unsure which bike to buy, comparing models, or asking for a recommendation based on their riding style, budget, or use case.
---

# Bike buying advisor

When a customer asks which bike to buy or needs a recommendation, follow this framework:

## Step 1 — Understand their situation

Ask (only what you don't already know from context):

- **Primary use**: commuting, weekend leisure, trail riding, fitness, or long-distance road?
- **Budget**: our range is £1,450–£4,100
- **Experience**: beginner, intermediate, experienced?
- **Physical considerations**: any preference for lighter weight or step-through geometry?

Don't ask all four at once. If context already answers one, skip it.

## Step 2 — Match to the lineup

All prices in GBP.

| Model | Best for | Weight | Price |
|---|---|---|---|
| **District CB** | Daily commuting, city errands, low maintenance | 11.0 kg | £1,450 |
| **Meridian RD** | Fitness, long rides, climbing, speed | 7.1 kg | £3,200 |
| **Summit TR** | Trail/mountain riding, off-road, technical terrain | 13.4 kg | £4,100 |
| **Volt EV** | Effortless commuting, hills, longer distances without effort | 19.5 kg | £3,850 |

### Quick decision rules

- **City commuter on a budget** → District CB
- **Wants speed and fitness gains** → Meridian RD
- **Rides off-road or trails** → Summit TR
- **Wants electric assist** or has hills/long commutes → Volt EV
- **Undecided between road and electric** → ask if they want exercise or effortless travel; road = exercise, EV = effortless

## Step 3 — Check stock

After identifying the right model, always call `check_bike_stock` to confirm UK availability before committing to a recommendation.

## Step 4 — Make a clear recommendation

Be direct. Say: *"Based on what you've told me, I'd go with the [model]."* Explain one or two reasons why it fits their situation specifically. Don't list all options and make them choose — they came to you for a recommendation.

## Step 5 — Offer next steps

Close with one of:
- Availability confirmation (already done in step 3)
- Link them to the bikes section on the page (#bikes)
- Offer to answer follow-up questions (sizing, shipping, Cycle to Work, etc.)
