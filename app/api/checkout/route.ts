import Stripe from 'stripe'
import { z } from 'zod'
import { findBikeById } from '@/lib/bikes'
import { getSiteUrl } from '@/lib/site-url'

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        bikeId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1),
})

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(key)
}

export async function POST(request: Request) {
  try {
    const body = checkoutSchema.parse(await request.json())
    const stripe = getStripe()
    const siteUrl = getSiteUrl(request)

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    for (const item of body.items) {
      const bike = findBikeById(item.bikeId)
      if (!bike) {
        return Response.json({ error: `Unknown bike: ${item.bikeId}` }, { status: 400 })
      }

      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(bike.price * 100),
          product_data: {
            name: bike.name,
            description: bike.spec,
            metadata: { bikeId: bike.id },
          },
        },
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['GB'],
      },
    })

    if (!session.url) {
      return Response.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 })
    }

    return Response.json({ url: session.url })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Invalid basket payload' }, { status: 400 })
    }
    console.error('[checkout]', err)
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
