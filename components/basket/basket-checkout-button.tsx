'use client'

import { useState } from 'react'
import { useBasket } from '@/components/basket/basket-provider'

export function BasketCheckoutButton() {
  const { items } = useBasket()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function checkout() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Checkout failed')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void checkout()}
        disabled={loading || items.length === 0}
        className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Redirecting to Stripe…' : 'Checkout with Stripe'}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Test mode — use card 4242 4242 4242 4242, any future date, any CVC.
      </p>
    </div>
  )
}
