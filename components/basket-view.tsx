'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FaqBotLauncher } from '@/components/faq-bot-launcher'
import { BasketCheckoutButton } from '@/components/basket-checkout-button'
import { useBasket } from '@/components/basket-provider'
import type { Bike } from '@/lib/bike-types'
import { priceFormatter } from '@/lib/content'

type BasketViewProps = {
  catalog: Bike[]
}

export function BasketView({ catalog }: BasketViewProps) {
  const { items, removeItem, count } = useBasket()

  const catalogById = new Map(catalog.map((bike) => [bike.modelId, bike]))

  const rows = items
    .map((item) => {
      const bike = catalogById.get(item.bikeId)
      if (!bike) return null
      return { bike, quantity: item.quantity }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  const total = rows.reduce((sum, row) => sum + row.bike.priceGbp * row.quantity, 0)

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Continue shopping
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Basket</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count === 0 ? 'Your basket is empty.' : `${count} item${count === 1 ? '' : 's'}`}
          </p>
        </header>

        {rows.length === 0 ? (
          <Link
            href="/#bikes"
            className="inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Browse bikes
          </Link>
        ) : (
          <div className="space-y-6">
            <ul className="divide-y divide-border rounded-xl border border-border">
              {rows.map(({ bike, quantity }) => (
                <li key={bike.modelId} className="flex gap-4 p-4">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-bike-surface">
                    <Image
                      src={bike.image}
                      alt={bike.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                          {bike.category}
                        </p>
                        <h2 className="text-base font-semibold">{bike.name}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">Qty {quantity}</p>
                      </div>
                      <p className="shrink-0 text-sm font-medium">
                        {priceFormatter.format(bike.priceGbp * quantity)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(bike.modelId)}
                      className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total (VAT included)</span>
              <span className="text-lg font-semibold">{priceFormatter.format(total)}</span>
            </div>

            <BasketCheckoutButton />
          </div>
        )}
      </div>
      <SiteFooter />
      <FaqBotLauncher />
    </main>
  )
}
